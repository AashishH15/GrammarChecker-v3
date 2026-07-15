import { X } from "@phosphor-icons/react";
import LanguageDropdown from "./LanguageDropdown.jsx";

export const LANGUAGES = [
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-CA", label: "English (Canada)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-NZ", label: "English (New Zealand)" },
  { code: "en-ZA", label: "English (South Africa)" },
];

export default function Settings({ open, language, onLanguageChange, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/20 px-4 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-hairline bg-white p-6 lex-card-enter"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Settings
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted transition-transform duration-200 hover:scale-110 hover:text-ink"
            aria-label="Close settings"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Language
          </p>
          <p className="mt-1 font-sans text-xs text-muted">
            Sets the spelling and grammar rules used when proofreading.
          </p>
          <div className="mt-3">
            <LanguageDropdown
              options={LANGUAGES}
              value={language}
              onChange={onLanguageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
