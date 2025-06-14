import React from "react";
import { TagType } from "@/utils/storage";
import LetterEngagementBar from "./LetterEngagementBar";

const tagColor: Record<TagType, string> = {
  Love: "bg-love text-pink-700",
  Regret: "bg-regret text-indigo-700",
  Goodbye: "bg-goodbye text-sky-700",
  Gratitude: "bg-gratitude text-green-700",
  Confession: "bg-confession text-amber-800",
  Rage: "bg-rage text-rose-700",
  Closure: "bg-closure text-gray-700"
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
}> = ({ letter }) => (
  <div className="shadow-diary bg-card rounded-xl p-5 mb-6 relative animate-fade-in border border-gray-200 max-w-2xl mx-auto">
    {letter.tag && (
      <span className={`absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-semibold shadow ${tagColor[letter.tag]} border border-white select-none`}>
        {letter.tag}
      </span>
    )}
    <p className="text-gray-800 min-h-[60px] whitespace-pre-line break-words text-base">{safeText(letter.text)}</p>
    <div className="flex items-center justify-between mt-4 mb-1">
      <span className="text-xs text-gray-400">{formatDate(letter.createdAt)}</span>
      <span className="italic text-xs text-gray-300">Anonymous</span>
    </div>
    <div className="mt-2">
      <LetterEngagementBar letterId={letter.id} text={letter.text} tag={letter.tag} />
    </div>
  </div>
);

export default LetterCard;
