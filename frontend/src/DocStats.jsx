import { useEffect, useState } from "react";

const WORDS_PER_MINUTE = 225;

function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

function readingTime(words) {
  const totalSeconds = Math.round((words / WORDS_PER_MINUTE) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function DocStats({ editor }) {
  const [words, setWords] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const update = () => setWords(countWords(editor.getText()));
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  return (
    <div className="mt-6 pt-4 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted">
          Reading Time
        </span>
        <span className="text-xs text-ink">{readingTime(words)}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted">
          Word Count
        </span>
        <span className="text-xs text-ink">
          {words} {words === 1 ? "Word" : "Words"}
        </span>
      </div>
    </div>
  );
}
