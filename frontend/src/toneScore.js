export const TONE_TOOLS = [
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

const ACADEMIC_MARKERS = [
  "analyze",
  "analyse",
  "demonstrate",
  "hypothesis",
  "furthermore",
  "consequently",
  "therefore",
  "methodology",
  "empirical",
];

const FORMAL_MARKERS = [
  "shall",
  "hence",
  "thus",
  "moreover",
  "nevertheless",
  "accordingly",
  "pursuant",
  "hereby",
  "furthermore",
  "therefore",
];

const PROFESSIONAL_MARKERS = [
  "furthermore",
  "consequently",
  "therefore",
  "however",
  "additionally",
];

const CASUAL_MARKERS = [
  "hey",
  "cool",
  "awesome",
  "lol",
  "haha",
  "stuff",
  "yeah",
];

const PLAYFUL_MARKERS = [
  "hey",
  "cool",
  "awesome",
  "yay",
  "woohoo",
  "fun",
  "silly",
];

const EMPATHETIC_MARKERS = [
  "understand",
  "feel",
  "support",
  "listen",
  "care",
  "compassion",
  "together",
];

const PERSUASIVE_MARKERS = [
  "must",
  "should",
  "action",
  "proven",
  "vital",
  "crucial",
  "ensure",
  "benefit",
];

const HUMOROUS_MARKERS = [
  "lol",
  "haha",
  "lmao",
  "kidding",
  "joke",
  "funny",
  "silly",
  "hilarious",
  "ironic",
];

const FRIENDLY_MARKERS = ["dont", "youre", "thanks", "thank you"];

function countOccurrences(text, re) {
  return (text.match(re) || []).length;
}

function countWords(text, words) {
  let total = 0;
  for (const word of words) {
    total += countOccurrences(text, new RegExp(`\\b${word}\\b`, "g"));
  }
  return total;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusFor(score) {
  if (score >= 75) return "STRONG TONE SIGNAL";
  if (score >= 40) return "MIXED TONE SIGNALS";
  return "NEUTRAL / UNCLEAR";
}

function scoreFriendly(text) {
  const pronouns = countOccurrences(text, /\b(i|you|we|our)\b/g);
  const exclaims = countOccurrences(text, /!/g);
  const casual = countWords(text, FRIENDLY_MARKERS);
  const parts = [
    { label: "Pronouns", value: pronouns * 15 },
    { label: "Exclamations", value: exclaims * 15 },
    { label: "Casual markers", value: casual * 15 },
  ];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scoreProfessional(text) {
  const formal = countWords(text, PROFESSIONAL_MARKERS);
  const contractions = countOccurrences(text, /[a-z]+'[a-z]+/g);
  const parts = [
    { label: "Formal transitions", value: formal * 20 },
    { label: "Contractions", value: -contractions * 10 },
  ];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scoreAcademic(text) {
  const markers = countWords(text, ACADEMIC_MARKERS);
  const contractions = countOccurrences(text, /[a-z]+'[a-z]+/g);
  const parts = [
    { label: "Academic terms", value: markers * 15 },
    { label: "Contractions", value: -contractions * 8 },
  ];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scoreFormal(text) {
  const markers = countWords(text, FORMAL_MARKERS);
  const contractions = countOccurrences(text, /[a-z]+'[a-z]+/g);
  const parts = [
    { label: "Formal terms", value: markers * 18 },
    { label: "Contractions", value: -contractions * 8 },
  ];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scoreCasual(text) {
  const markers = countWords(text, CASUAL_MARKERS);
  const exclaims = countOccurrences(text, /!/g);
  const parts = [
    { label: "Casual markers", value: markers * 18 },
    { label: "Exclamations", value: exclaims * 18 },
  ];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scorePlayful(text) {
  const markers = countWords(text, PLAYFUL_MARKERS);
  const exclaims = countOccurrences(text, /!/g);
  const parts = [
    { label: "Playful markers", value: markers * 18 },
    { label: "Exclamations", value: exclaims * 18 },
  ];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scoreEmpathetic(text) {
  const markers = countWords(text, EMPATHETIC_MARKERS);
  const parts = [{ label: "Connection terms", value: markers * 14 }];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scorePersuasive(text) {
  const markers = countWords(text, PERSUASIVE_MARKERS);
  const parts = [{ label: "Persuasive hooks", value: markers * 14 }];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function scoreHumorous(text) {
  const markers = countWords(text, HUMOROUS_MARKERS);
  const exclaims = countOccurrences(text, /!/g);
  const parts = [
    { label: "Humorous markers", value: markers * 16 },
    { label: "Exclamations", value: exclaims * 16 },
  ];
  const rawScore = clamp(sumParts(parts));
  return { score: rawScore, parts: normalizeParts(parts, rawScore) };
}

function sumParts(parts) {
  return parts.reduce((sum, p) => sum + p.value, 0);
}

// Scales each part's raw value so the positive contributions sum exactly to
// the final clamped score (e.g. a 56% alignment shows parts totaling +56).
// Negative parts keep their sign but are scaled by the same ratio so the
// composition reads as a clean percentage breakdown.
function normalizeParts(parts, score) {
  const rawTotal = sumParts(parts);
  if (rawTotal === 0) {
    return parts.map((p) => ({ ...p, value: 0 }));
  }
  const ratio = score / rawTotal;
  return parts.map((p) => ({
    ...p,
    value: Math.round(p.value * ratio),
  }));
}

const SCORERS = {
  Friendly: scoreFriendly,
  Professional: scoreProfessional,
  Academic: scoreAcademic,
  Formal: scoreFormal,
  Casual: scoreCasual,
  Playful: scorePlayful,
  Empathetic: scoreEmpathetic,
  Persuasive: scorePersuasive,
  Humorous: scoreHumorous,
};

// Raw, unscaled tone signal for a single profile. Used both by scoreTone and
// detectTone when building the absolute tonal distribution.
export function rawScoreForTone(lowerText, tone) {
  const scorer = SCORERS[tone];
  if (!scorer) {
    return 0;
  }
  return scorer(lowerText).score;
}

export function scoreTone(text, tone) {
  const scorer = SCORERS[tone];
  if (!scorer) {
    return null;
  }
  const lower = text.toLowerCase();

  // Absolute Tonal Distribution: score every profile, then express the
  // requested tone as its clean, positive share of the total prose footprint.
  const rawScores = TONE_TOOLS.map((t) => ({
    tone: t,
    raw: rawScoreForTone(lower, t),
  }));
  const grandTotal = rawScores.reduce((sum, r) => sum + r.raw, 0);
  if (grandTotal === 0) {
    const flat = Math.round(100 / TONE_TOOLS.length);
    return {
      label: tone.toUpperCase(),
      score: flat,
      status: statusFor(flat),
      parts: [],
    };
  }

  const target = rawScores.find((r) => r.tone === tone);
  const score = Math.round((target.raw / grandTotal) * 100);

  return {
    label: tone.toUpperCase(),
    score,
    status: statusFor(score),
    parts: [],
  };
}

export function detectTone(text) {
  const lower = text.toLowerCase().trim();
  if (!lower) {
    return null;
  }

  // Score every profile, then convert raw signals into positive percentage
  // shares of the prose's total tonal footprint.
  const rawScores = TONE_TOOLS.map((tone) => ({
    tone,
    raw: rawScoreForTone(lower, tone),
  }));
  const grandTotal = rawScores.reduce((sum, r) => sum + r.raw, 0);

  if (grandTotal === 0) {
    const flat = Math.round(100 / TONE_TOOLS.length);
    const numbers = TONE_TOOLS.slice().sort();
    const dominant = numbers[0];
    return {
      label: "NEUTRAL / UNCLEAR",
      score: flat,
      status: statusFor(flat),
      parts: numbers
        .filter((t) => t !== dominant)
        .map((t) => ({ label: `${t} Signals`, value: flat })),
    };
  }

  const withPct = rawScores
    .map((r) => ({ tone: r.tone, percentage: Math.round((r.raw / grandTotal) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  const [dominant] = withPct;
  const parts = withPct
    .filter((r) => r.percentage > 0)
    .map((r) => ({ label: `${r.tone} Signals`, value: r.percentage }));

  // Only call it neutral when no tone stands out at all (a genuinely flat or
  // near-empty signal). A clearly dominant tone — even if a close second exists
  // (e.g. Friendly 36 / Casual 33) — is a real tone, not "unclear".
  if (dominant.percentage < 20) {
    return {
      label: "NEUTRAL / UNCLEAR",
      score: dominant.percentage,
      status: statusFor(dominant.percentage),
      parts,
    };
  }

  return {
    label: dominant.tone.toUpperCase(),
    score: dominant.percentage,
    status: statusFor(dominant.percentage),
    parts: parts.filter((p) => p.label !== `${dominant.tone} Signals`),
  };
}
