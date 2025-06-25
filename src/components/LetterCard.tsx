import React from "react";
import { TagType } from "@/utils/storage";
import LetterEngagementBar from "./LetterEngagementBar";

interface TagThemeDetails {
  cardClasses: string;
  tagBadgeClasses: string;
}

const tagThemeStyles: Record<TagType, TagThemeDetails> = {
  Love: {
    cardClasses: "bg-love-card text-love-foreground border-love-accent",
    tagBadgeClasses: "bg-love text-love-text",
  },
  Regret: {
    cardClasses: "bg-regret-card text-regret-foreground border-regret-accent",
    tagBadgeClasses: "bg-regret text-regret-text",
  },
  Goodbye: {
    cardClasses: "bg-goodbye-card text-goodbye-foreground border-goodbye-accent",
    tagBadgeClasses: "bg-goodbye text-goodbye-text",
  },
  Gratitude: {
    cardClasses: "bg-gratitude-card text-gratitude-foreground border-gratitude-accent",
    tagBadgeClasses: "bg-gratitude text-gratitude-text",
  },
  Confession: {
    cardClasses: "bg-confession-card text-confession-foreground border-confession-accent",
    tagBadgeClasses: "bg-confession text-confession-text",
  },
  Rage: {
    cardClasses: "bg-rage-card text-rage-foreground border-rage-accent",
    tagBadgeClasses: "bg-rage text-rage-text",
  },
  Closure: {
    cardClasses: "bg-closure-card text-closure-foreground border-closure-accent",
    tagBadgeClasses: "bg-closure text-closure-text",
  },
};

const defaultThemeDetails: TagThemeDetails = {
  cardClasses: "bg-card text-foreground border-border", // Using theme variables for default
  tagBadgeClasses: "", // No badge if no tag
};

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime()-d.getTime())/1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return d.toLocaleDateString();
}

// Escape for text-only output (prevents HTML/script abuse)
function safeText(text: string) {
  return text
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/&/g,"&amp;");
}

const LetterCard: React.FC<{
  letter: { id: string; text: string; tag: TagType | null; createdAt: number };
}> = ({ letter }) => {
  const themeDetails = letter.tag ? tagThemeStyles[letter.tag] : defaultThemeDetails;

  return (
    <div className={`shadow-diary rounded-xl p-5 mb-6 relative animate-fade-in border max-w-2xl mx-auto ${themeDetails.cardClasses}`}>
      {letter.tag && (
        <span className={`absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-semibold shadow ${themeDetails.tagBadgeClasses} border border-white select-none`}>
          {letter.tag}
        </span>
      )}
      {/* The text color will be inherited from themeDetails.cardClasses (e.g., text-love-foreground) */}
      <p className="min-h-[60px] whitespace-pre-line break-words text-base">{safeText(letter.text)}</p>
      <div className="flex items-center justify-between mt-4 mb-1">
        {/* Ensure these utility text colors don't clash or override the theme. Consider making them part of the theme if needed. */}
        <span className="text-xs text-gray-400">{formatDate(letter.createdAt)}</span>
      <span className="italic text-xs text-gray-300">Anonymous</span>
    </div>
    <div className="mt-2">
      <LetterEngagementBar letterId={letter.id} text={letter.text} tag={letter.tag} />
    </div>
  </div>
);

export default LetterCard;
