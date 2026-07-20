import SuggestionCard from "./SuggestionCard.jsx";
import DocStats from "./DocStats.jsx";
import { ArrowLineRight, CircleNotch, Warning } from "@phosphor-icons/react";

export default function ReviewPanel({
  editor,
  activeTool,
  grammarMatches,
  checking,
  userResolvedAll,
  activeErrorId,
  aboutToCollapse,
  onApply,
  onDismiss,
  onAcceptAll,
  onDismissAll,
  onAddToDictionary,
  onLocate,
  onCollapse,
  onClear,
  transformResult,
  transformStatus,
  transformError,
  onApplyTransform,
  onDismissTransform,
}) {
  const count = grammarMatches.length;

  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-4">
      <div className="flex items-center justify-between gap-3">
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className={
              "rounded p-1 transition-colors hover:bg-hairline/60 " +
              (aboutToCollapse ? "text-amber-500" : "text-muted hover:text-ink")
            }
            aria-label="Collapse right panel"
            title="Collapse panel"
          >
            <ArrowLineRight size={14} weight="bold" />
          </button>
        )}
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
          Review
        </p>
      </div>

      <div className="lex-scroll mt-4 flex-1 overflow-auto pr-1">
        {!activeTool ? (
          <>
            <p className="text-sm leading-relaxed text-muted">
              Click <span className="font-semibold text-ink">Proofread</span> to
              scan the draft, or run any tool from Actions — its suggestion
              appears here to review.
            </p>
            <p className="font-mono text-xs lowercase tracking-[0.04em] text-muted mt-3">
              status :: awaiting selection...
            </p>
          </>
        ) : activeTool === "Proofread" ? (
          checking ? (
            <p className="font-mono text-xs lowercase tracking-[0.04em] text-muted">
              status :: initializing engine<span className="lex-ellipsis">...</span>
            </p>
          ) : count === 0 ? (
            <p className="font-mono text-xs lowercase tracking-[0.04em] text-muted">
              status :: {userResolvedAll ? "no issues remaining" : "no issues found"}
            </p>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onAcceptAll}
                  className="rounded-full bg-pale-green px-2.5 py-px font-mono text-[10px] uppercase tracking-widest text-pale-green-text transition-colors hover:bg-pale-green/70"
                >
                  Accept all {count} {count === 1 ? "Suggestion" : "Suggestions"}
                </button>
                <button
                  type="button"
                  onClick={onDismissAll}
                  className="rounded-full px-2.5 py-px font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:bg-pale-red hover:text-pale-red-text"
                >
                  Dismiss All
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-ink"
                >
                  Clear
                </button>
              </div>
              <ul className="flex flex-col gap-3">
                {grammarMatches.map((match, i) => (
                  <SuggestionCard
                    key={match.id}
                    match={match}
                    index={i}
                    active={activeErrorId === match.id}
                    onApply={onApply}
                    onDismiss={onDismiss}
                    onAddToDictionary={onAddToDictionary}
                    onLocate={onLocate}
                  />
                ))}
              </ul>
            </>
          )
        ) : (
          <TransformView
            tool={activeTool}
            status={transformStatus}
            error={transformError}
            result={transformResult}
            onApply={onApplyTransform}
            onDismiss={onDismissTransform}
          />
        )}
      </div>

      <DocStats editor={editor} />
    </div>
  );
}

function TransformView({ tool, status, error, result, onApply, onDismiss }) {
  if (status === "warming" || status === "working") {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-hairline bg-canvas px-4 py-3">
        <CircleNotch size={16} weight="bold" className="mt-0.5 animate-spin text-muted" />
        <div>
          <p className="font-sans text-sm text-ink">
            {status === "warming" ? "Warming up the local model…" : "Working…"}
          </p>
          <p className="font-mono text-xs lowercase tracking-[0.04em] text-muted mt-1">
            status :: {status === "warming" ? "loading engine" : "generating"}
            <span className="lex-ellipsis">...</span>
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-pale-red bg-pale-red/40 px-4 py-3">
        <Warning size={16} weight="bold" className="mt-0.5 text-pale-red-text" />
        <div>
          <p className="font-sans text-sm font-medium text-pale-red-text">
            {tool} couldn&rsquo;t run
          </p>
          <p className="font-sans text-xs leading-relaxed text-muted mt-1">
            {error || "The local model returned an error. Try again, or check your AI setup."}
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="rounded-xl border border-hairline bg-white p-6 pb-4 lex-card-enter">
        <span className="inline-block rounded bg-pale-blue px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-pale-blue-text">
          {result.tool} Result
        </span>
        <div className="mt-3 whitespace-pre-wrap font-sans text-sm leading-loose text-ink">
          {result.text}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded bg-ink py-2 font-sans text-sm font-medium text-white transition-transform duration-150 active:scale-[0.98]"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded border border-hairline bg-transparent py-2 font-sans text-sm font-medium text-ink transition-transform duration-150 active:scale-[0.98]"
          >
            Dismiss
          </button>
        </div>
        <p className="mt-3 font-mono text-[10px] lowercase tracking-[0.04em] text-muted">
          status :: review the suggestion, then apply to replace the source text
        </p>
      </div>
    );
  }

  // Idle: tool selected, awaiting first run / result.
  return (
    <p className="font-mono text-xs lowercase tracking-[0.04em] text-muted">
      status :: awaiting transform<span className="lex-ellipsis">...</span>
    </p>
  );
}
