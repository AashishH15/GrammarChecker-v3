export default function GrammarTooltip({ match, rect, onApply, onDismiss }) {
  if (!match || !rect) {
    return null;
  }

  const style = {
    position: "fixed",
    top: rect.bottom + 6,
    left: rect.left,
    zIndex: 50,
  };

  return (
    <div
      style={style}
      onMouseLeave={onDismiss}
      className="w-72 rounded-lg border border-hairline bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <p className="text-sm text-ink">{match.message}</p>
      {match.replacements.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {match.replacements.slice(0, 4).map((replacement, i) => (
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
      ) : (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          No suggestion available
        </p>
      )}
    </div>
  );
}
