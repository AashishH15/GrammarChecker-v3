import {
  CheckCircle,
  PencilSimple,
  TextT,
  ChatCircleText,
  Briefcase,
  Article,
  ListChecks,
  ListBullets,
  Table,
  GraduationCap,
  Suitcase,
  TShirt,
  Sparkle,
  Heart,
  Megaphone,
  Smiley,
} from "@phosphor-icons/react";

const groups = [
  { label: "Analysis", tools: [{ name: "Proofread", icon: CheckCircle }] },
  {
    label: "Refinement",
    tools: [
      { name: "Rewrite", icon: PencilSimple },
      { name: "Concise", icon: TextT },
    ],
  },
  {
    label: "Tone",
    tools: [
      { name: "Friendly", icon: ChatCircleText },
      { name: "Professional", icon: Briefcase },
      { name: "Academic", icon: GraduationCap },
      { name: "Formal", icon: Suitcase },
      { name: "Casual", icon: TShirt },
      { name: "Playful", icon: Sparkle },
      { name: "Empathetic", icon: Heart },
      { name: "Persuasive", icon: Megaphone },
      { name: "Humorous", icon: Smiley },
    ],
  },
  {
    label: "Structure",
    tools: [
      { name: "Summary", icon: Article },
      { name: "Key Points", icon: ListChecks },
      { name: "List", icon: ListBullets },
      { name: "Table", icon: Table },
    ],
  },
];

export default function Toolbar({ editor, activeTool, onToolClick, panelWidth, isMac }) {
  // Below this panel width the Proofread shortcut hint can't fit alongside
  // the label, so we drop it to keep the row from wrapping/cramping.
  const showProofreadHint = (panelWidth ?? 256) >= 220;
  const proofreadHint = isMac ? "⌘ + ↵" : "Ctrl + ↵";
  return (
    <nav className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted mb-2">
            {group.label}
          </p>
          <ul className="flex flex-col">
            {group.tools.map(({ name, icon: Icon }) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onToolClick(name)}
                  aria-pressed={activeTool === name}
                  className={
                    "group flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-sm transition-colors " +
                    (activeTool === name
                      ? "bg-ink text-white"
                      : "text-ink hover:bg-hairline/60")
                  }
                >
                  <Icon
                    size={16}
                    weight="bold"
                    className="transition-transform duration-200 group-hover:scale-125"
                  />
                  <span className="transition-transform duration-200 group-hover:scale-105">
                    {name}
                  </span>
                  {name === "Proofread" && showProofreadHint && (
                    <kbd className="ml-auto rounded border border-current/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider opacity-60">
                      {proofreadHint}
                    </kbd>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
