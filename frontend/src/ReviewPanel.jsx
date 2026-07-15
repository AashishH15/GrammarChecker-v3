export default function ReviewPanel({
  selectedText,
  activeTool,
  grammarMatches,
  onApply,
  onClear,
}) {
  return (
    <div className="flex flex-col h-full">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted mb-3">
        Review Panel
      </p>
      {activeTool ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted">
              {activeTool}
            </p>
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] uppercase tracking-[0.08em] text-muted hover:text-ink"
            >
              Clear
            </button>
          </div>
          {selectedText ? (
            <p className="text-sm text-ink">{selectedText}</p>
          ) : (
            <p className="text-sm text-muted">No text selected in the document.</p>
          )}
          {grammarMatches.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {grammarMatches.map((match) => (
                <li
                  key={match.id}
                  className="rounded border border-hairline bg-pale-red/40 p-2"
                >
                  <p className="text-sm text-ink">{match.message}</p>
                  {match.replacements.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {match.replacements.slice(0, 3).map((replacement, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onApply(match, replacement)}
                          className="rounded border border-hairline bg-pale-green px-2 py-1 text-xs text-pale-green-text transition-transform duration-200 hover:scale-105"
                        >
                          {replacement}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">No output yet. Run a tool to see results.</p>
      )}
    </div>
  );
}
