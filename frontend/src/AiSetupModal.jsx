import { useEffect, useRef, useState } from "react";
import { X, DownloadSimple, ArrowRight, Cpu } from "@phosphor-icons/react";
import Toggle from "./Toggle.jsx";
import { getAiStatus, downloadModel, getModelStatus } from "./api.js";

const AI_SETUP_KEY = "lexicon:aiSetupDone";
// Approximate download size shown up-front so the user can judge disk impact
// before opting in. The hard guard lives server-side.
const BUNDLE_SIZE_GB = 1.4;

export default function AiSetupModal({ onClose }) {
  const [status, setStatus] = useState({
    ollama_available: false,
    model_ready: false,
    active_backend: "bundled",
  });
  const [probeDone, setProbeDone] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wantBundle, setWantBundle] = useState(false); // opt-in, OFF by default
  const [useOllama, setUseOllama] = useState(false);
  const [phase, setPhase] = useState("choose"); // choose | downloading | done | error
  const [progress, setProgress] = useState(null); // {bytes_done, bytes_total}
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  // Probe backend state once on mount. Render immediately with a safe default
  // (no Ollama assumed) so the modal appears at once; fill in the real status
  // when the backend responds, rather than showing nothing until then.
  useEffect(() => {
    let cancelled = false;
    getAiStatus()
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        if (!cancelled)
          setStatus({ ollama_available: false, model_ready: false, active_backend: "bundled" });
      })
      .finally(() => {
        if (!cancelled) setProbeDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const st = await getModelStatus();
        setProgress({ bytes_done: st.bytes_done, bytes_total: st.bytes_total });
        if (st.state === "ready") {
          stopPolling();
          setPhase("done");
        } else if (st.state === "error") {
          stopPolling();
          setPhase("error");
          setError(st.error || "Download failed.");
        }
      } catch {
        // ignore transient poll errors; next tick retries
      }
    }, 500);
  }

  async function handleDownload() {
    setPhase("downloading");
    setProgress({ bytes_done: 0, bytes_total: 0 });
    startPolling();
    try {
      await downloadModel("2b");
      // download_model resolves only after completion; ensure final state.
      const st = await getModelStatus();
      setProgress({ bytes_done: st.bytes_done, bytes_total: st.bytes_total });
      stopPolling();
      setPhase(st.state === "ready" ? "done" : "error");
      if (st.state !== "ready") setError(st.error || "Download did not complete.");
    } catch (exc) {
      stopPolling();
      setPhase("error");
      setError(exc.message || "Download failed.");
    }
  }

  function finish() {
    localStorage.setItem(AI_SETUP_KEY, "true");
    stopPolling();
    onClose();
  }

  const ollamaAvailable = status?.ollama_available;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4"
      onClick={finish}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-hairline bg-white lex-card-enter"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            AI Setup
          </p>
          <button
            type="button"
            onClick={finish}
            className="text-muted transition-transform duration-200 hover:scale-110 hover:text-ink"
            aria-label="Skip for now"
            title="Skip for now"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="lex-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {/* Hero: the Lexicon bundle */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pale-blue/40">
              <Cpu size={18} weight="bold" className="text-pale-blue-text" />
            </div>
            <div>
              <p className="font-sans text-base font-semibold text-ink">
                Run AI on your own machine
              </p>
              <p className="mt-1 font-sans text-xs leading-relaxed text-muted">
                Lexicon can rewrite, tighten, and retune your writing with a
                small local model. Nothing leaves your computer — no account,
                no cloud. The model downloads once (~{BUNDLE_SIZE_GB} GB) and
                lives in your app-data folder.
              </p>
            </div>
          </div>

          {/* Opt-in toggle (OFF by default) */}
          <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-hairline bg-canvas px-4 py-3">
            <div>
              <p className="font-sans text-sm font-medium text-ink">
                Download the Lexicon model
              </p>
              <p className="mt-0.5 font-sans text-xs text-muted">
                Enables Rewrite, Tone, and Structure tools. Off until you turn
                it on.
              </p>
            </div>
            <Toggle
              checked={wantBundle}
              onChange={(v) => {
                setWantBundle(v);
                if (v) setUseOllama(false);
              }}
              label="Download the Lexicon model"
            />
          </div>

          {/* Download progress (only while downloading) */}
          {phase === "downloading" && (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-hairline">
                <div
                  className={
                    "h-full rounded-full bg-pale-blue-text transition-all duration-300 " +
                    (progress && progress.bytes_total
                      ? ""
                      : "animate-pulse")
                  }
                  style={{
                    width:
                      progress && progress.bytes_total
                        ? `${Math.min(100, (progress.bytes_done / progress.bytes_total) * 100)}%`
                        : "100%",
                  }}
                />
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                Downloading model…{" "}
                {progress && progress.bytes_total
                  ? `${Math.round(progress.bytes_done / 1e6)} / ${Math.round(progress.bytes_total / 1e6)} MB`
                  : `${Math.round((progress?.bytes_done || 0) / 1e6)} MB`}
              </p>
            </div>
          )}

          {phase === "error" && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-sans text-xs text-red-700">
              {error}
            </p>
          )}

          {phase === "done" && (
            <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 font-sans text-xs text-green-700">
              Model ready. AI tools are now enabled.
            </p>
          )}

          {/* Advanced: bring your own Ollama */}
          <div className="mt-6 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className="font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-ink"
            >
              {showAdvanced ? "▾ Advanced" : "▸ Advanced"}
            </button>
            <div
              className={
                "grid transition-all duration-300 ease-out " +
                (showAdvanced ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
              }
            >
              <div className="overflow-hidden">
                <div className="rounded-lg border border-hairline bg-canvas px-4 py-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={useOllama}
                      disabled={!probeDone || !ollamaAvailable}
                      onChange={(e) => {
                        setUseOllama(e.target.checked);
                        if (e.target.checked) setWantBundle(false);
                      }}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-pale-blue-text"
                    />
                    <span>
                      <span className="font-sans text-sm font-medium text-ink">
                        Use my Ollama server
                      </span>
                      <span className="mt-0.5 block font-sans text-xs text-muted">
                        {ollamaAvailable
                          ? "Detected and ready. AI tools will use your existing Ollama models."
                          : "No Ollama server was detected on this machine."}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={finish}
            className="rounded px-3 py-2 font-sans text-sm text-muted transition-colors hover:text-ink"
          >
            Skip for now
          </button>
          {phase === "done" ? (
            <button
              type="button"
              onClick={finish}
              className="flex items-center gap-1.5 rounded bg-pale-blue-text px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-pale-blue-text/90"
            >
              Continue <ArrowRight size={16} weight="bold" />
            </button>
          ) : wantBundle ? (
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded bg-pale-blue-text px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-pale-blue-text/90"
            >
              <DownloadSimple size={16} weight="bold" /> Download & enable
            </button>
          ) : useOllama ? (
            <button
              type="button"
              onClick={finish}
              className="flex items-center gap-1.5 rounded bg-pale-blue-text px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-pale-blue-text/90"
            >
              Continue <ArrowRight size={16} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="rounded border border-hairline bg-canvas px-4 py-2 font-sans text-sm font-medium text-ink transition-colors hover:border-muted"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
