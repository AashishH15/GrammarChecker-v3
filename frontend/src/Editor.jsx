export default function Editor() {
  return (
    <div className="flex flex-col h-full">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted mb-3">
        Source Document
      </p>
      <textarea
        className="flex-1 w-full resize-none rounded border border-hairline bg-white p-4 text-ink leading-relaxed outline-none focus:border-muted"
        placeholder="Start writing, or paste your text here."
      />
    </div>
  );
}
