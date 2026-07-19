import { useEffect } from "react";
import { Sparkle } from "@phosphor-icons/react";

// Minimal "AI tools coming soon" notice.
export default function ComingSoonNotice({ tool, onDismiss }) {
  useEffect(() => {
    if (!tool) {
      return;
    }
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [tool, onDismiss]);

  if (!tool) {
    return null;
  }

  return (
    <div
      className="lex-no-print pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="lex-pop pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border border-hairline bg-white px-4 py-3">
        <Sparkle
          size={18}
          weight="bold"
          className="mt-0.5 shrink-0 text-pale-blue-text"
        />
        <div className="min-w-0">
          <p className="font-sans text-sm font-medium text-ink">
            {tool} is coming soon
          </p>
          <p className="mt-0.5 font-sans text-xs text-muted">
            This runs on a local AI model that isn&rsquo;t wired up in this
            build yet. Proofread works now; the rewriting and tone tools
            are next.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 shrink-0 rounded p-1 text-muted transition-colors hover:bg-hairline/60 hover:text-ink"
          aria-label="Dismiss"
        >
          <span className="block text-base leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
}
