import { EditorContent } from "@tiptap/react";
import { Info } from "@phosphor-icons/react";
import FormatToolbar from "./FormatToolbar.jsx";

export default function Editor({
  editor,
  fontSize,
  lineSpacing,
  clarityScore,
  complexity,
  emptyDoc,
  proofreadActive,
}) {
  const hasMetrics = proofreadActive && !emptyDoc;

  return (
    <div className="flex flex-col h-full">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted mb-3">
        Source Document
      </p>
      <FormatToolbar editor={editor} />

      <div className="mt-4 grid grid-cols-2 gap-4 mb-6">
        <div className="lex-card-enter rounded border border-hairline bg-white p-6">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="font-mono text-xs uppercase leading-none tracking-widest text-[#787774]">
              Clarity Score
            </span>
            <span className="group relative inline-flex">
              <Info size={13} weight="bold" className="-mt-px text-[#787774]" />
              <span className="pointer-events-none absolute left-0 top-5 z-10 w-60 rounded-md border border-hairline bg-white p-3 font-sans text-[11px] leading-relaxed text-muted opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                A readbility score from 0 to 100. It uses an error density
                ratio, not a raw count: Clarity = 100 minus (active
                suggestions divided by total word count, times 100, times a
                severity weight of 12).
              </span>
            </span>
          </div>
          <p className="font-serif text-4xl font-bold text-[#111111]">
            {hasMetrics ? clarityScore : "-"}
          </p>
          {hasMetrics && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#EAEAEA]">
              <div
                className="h-full bg-[#111111] transition-all duration-500 ease-out"
                style={{ width: `${clarityScore}%` }}
              />
            </div>
          )}
        </div>
        <div className="lex-card-enter rounded border border-hairline bg-white p-6">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="font-mono text-xs uppercase leading-none tracking-widest text-[#787774]">
              Complexity
            </span>
            <span className="group relative inline-flex">
              <Info size={13} weight="bold" className="-mt-px text-[#787774]" />
              <span className="pointer-events-none absolute left-0 top-5 z-10 w-56 rounded-md border border-hairline bg-white p-3 font-sans text-[11px] leading-relaxed text-muted opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                Estimates reading difficulty from average word length.
                "Standard Prose" applies below ~5.2 characters per word;
                "Advanced / Academic" applies at or above that threshold.
              </span>
            </span>
          </div>
          <p className="font-serif text-4xl font-bold text-[#111111]">
            {hasMetrics ? complexity : "N/A"}
          </p>
        </div>
      </div>

      <div className="lex-scroll flex-1 overflow-auto rounded border border-hairline bg-white">
        <EditorContent
          editor={editor}
          style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
          className="h-full px-4 py-3 text-ink [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-full"
        />
      </div>
    </div>
  );
}
