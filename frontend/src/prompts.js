const SINGLE_SHOT = {
  Rewrite:
    "Rewrite the following text to improve clarity and flow while preserving its meaning, tone, and intent. Keep the same language. Return only the rewritten text and nothing else.",
  Concise:
    "Make the following text more concise. Remove redundancy and filler, tighten wording, and keep the meaning and tone intact. Return only the condensed text and nothing else.",
};

const TONE_TEMPLATE =
  "Rewrite the following text in a {tone} tone. Preserve the original meaning, facts, and any proper nouns; only shift the voice and register to sound {tone}. Keep the same language. Return only the rewritten text and nothing else.";

const TONES = [
  "Friendly",
  "Professional",
  "Academic",
  "Formal",
  "Casual",
  "Playful",
  "Empathetic",
  "Persuasive",
  "Humorous",
];

const STRUCTURE = {
  Summary:
    "Summarize the following text in a few concise sentences that capture its key message and essential points. Preserve accuracy. Return only the summary and nothing else.",
  "Key Points":
    "Extract the key points from the following text as a short bulleted list (one point per line, starting with a hyphen). Capture only the most important ideas. Return only the list and nothing else.",
  List:
    "Turn the following text into a clean bulleted list (one item per line, starting with a hyphen). Break the content into its natural items or steps. Return only the list and nothing else.",
  Table:
    "Convert the following text into a Markdown table that organizes its information into rows and columns. Choose sensible headers. Return only the Markdown table and nothing else.",
};

const PROMPTS = { ...SINGLE_SHOT, ...STRUCTURE };

TONES.forEach((tone) => {
  PROMPTS[tone] = TONE_TEMPLATE.replaceAll("{tone}", tone.toLowerCase());
});

export const AI_TOOL_NAMES = [
  "Rewrite",
  "Concise",
  ...TONES,
  "Summary",
  "Key Points",
  "List",
  "Table",
];

export function isAiTool(name) {
  return AI_TOOL_NAMES.includes(name);
}

// Returns the instruction prompt for a tool, or null if the tool isn't an
// AI transform (e.g. Proofread, which stays on LanguageTool).
export function promptForTool(name) {
  return PROMPTS[name] ?? null;
}
