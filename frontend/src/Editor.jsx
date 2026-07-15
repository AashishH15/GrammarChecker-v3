import { EditorContent } from "@tiptap/react";
import FormatToolbar from "./FormatToolbar.jsx";

export default function Editor({
  editor,
  fontSize,
  lineSpacing,
  clarityScore,
  complexity,
}) {
  return (
    <div className="flex flex-col h-full">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted mb-3">
        Source Document
      </p>
      <FormatToolbar editor={editor} />

      <div className="mt-4 grid grid-cols-2 gap-4 mb-6">
        <div className="lex-card-enter rounded border border-hairline bg-white p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-[#787774] mb-2">
            Clarity Score
          </p>
          <p className="font-serif text-4xl font-bold text-[#111111]">
            {clarityScore}
          </p>
        </div>
        <div className="lex-card-enter rounded border border-hairline bg-white p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-[#787774] mb-2">
            Complexity
          </p>
          <p className="font-serif text-4xl font-bold text-[#111111]">
            {complexity}
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
