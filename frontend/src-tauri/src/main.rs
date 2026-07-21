// Lexicon desktop shell (Tauri v2).

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::{SocketAddr, TcpStream};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};
use tauri::{Manager, RunEvent};

struct BackendChild(Mutex<Option<Child>>);
const BACKEND_PORT: u16 = 18000;

fn wait_for_backend(child: &mut Child, port: u16) -> Result<(), String> {
    let address: SocketAddr = format!("127.0.0.1:{port}")
        .parse()
        .map_err(|error| format!("invalid backend address: {error}"))?;
    let deadline = Instant::now() + Duration::from_secs(20);

    while Instant::now() < deadline {
        if let Some(status) = child
            .try_wait()
            .map_err(|error| format!("failed to inspect backend sidecar: {error}"))?
        {
            return Err(format!(
                "backend sidecar exited before becoming ready: {status}"
            ));
        }
        if TcpStream::connect_timeout(&address, Duration::from_millis(250)).is_ok() {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(100));
    }

    Err(format!(
        "backend sidecar did not become ready on 127.0.0.1:{port}"
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let resource_dir = app
                .path()
                .resource_dir()
                .expect("failed to resolve resource dir");

            // Bundled JRE (resources/jre) so LanguageTool needs no Java install.
            let jre_dir = resource_dir.join("jre");
            let java_home = if jre_dir.is_dir() {
                jre_dir.to_string_lossy().to_string()
            } else {
                String::new()
            };

            // Onedir sidecar: resources/lexicon-backend/lexicon-backend[.exe]
            // (the `_internal` folder sits beside it and is required at runtime).
            // PyInstaller adds `.exe` only on Windows; the macOS bundle uses
            // the extensionless executable name.
            let sidecar_name = if cfg!(target_os = "windows") {
                "lexicon-backend.exe"
            } else {
                "lexicon-backend"
            };
            let sidecar_exe: PathBuf = resource_dir.join("lexicon-backend").join(sidecar_name);

            let mut cmd = Command::new(&sidecar_exe);
            // Production uses a dedicated port so a running development
            // backend on 8000 cannot steal the desktop app's requests.
            // Keep the frontend and sidecar on the same production port.
            cmd.env("LEXICON_PORT", BACKEND_PORT.to_string());
            cmd.env("LEXICON_HOST", "127.0.0.1");
            cmd.env("LEXICON_JAVA_HOME", &java_home);
            if !java_home.is_empty() {
                cmd.env("JAVA_HOME", &java_home);
            }
            cmd.stdin(Stdio::null());
            cmd.stdout(Stdio::null());
            cmd.stderr(Stdio::null());

            let mut child = cmd
                .spawn()
                .map_err(|e| format!("failed to spawn backend sidecar {:?}: {e}", sidecar_exe))?;

            if let Err(error) = wait_for_backend(&mut child, BACKEND_PORT) {
                let _ = child.kill();
                return Err(error.into());
            }
            app.manage(BackendChild(Mutex::new(Some(child))));

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Lexicon")
        .run(|app_handle, event| {
            if let RunEvent::Exit = event {
                if let Some(state) = app_handle.try_state::<BackendChild>() {
                    if let Ok(mut child) = state.0.lock() {
                        if let Some(mut child) = child.take() {
                            let _ = child.kill();
                        }
                    }
                }
            }
        });
}
