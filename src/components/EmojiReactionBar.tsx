import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInteractionBlock } from "@/hooks/useInteractionBlock";

const EMOJIS = ["❤️", "😢", "😡", "😭", "😱", "🤗", "😶"];
type Props = { letterId: string };

const EmojiReactionBar: React.FC<Props> = ({ letterId }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { isBlocked, mark } = useInteractionBlock(letterId);

  async function fetchReactions() {
    setLoading(true);
    const { data } = await supabase
      .from("letter_reactions")
      .select("emoji, count:emoji")
      .eq("letter_id", letterId);

    // Aggregate counts
    const emojiCounts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      emojiCounts[row.emoji] = (emojiCounts[row.emoji] ?? 0) + 1;
    });
    setCounts(emojiCounts);
    setLoading(false);
  }

  useEffect(() => {
    fetchReactions();
  }, [letterId]);

  async function handleReact(emoji: string) {
    if (isBlocked("reaction", emoji)) return;
    // Backend rate limit
    const resp = await fetch("/functions/v1/interaction-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterId, action: "reaction" }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      setLoading(false);
      return;
    }
    await supabase
      .from("letter_reactions")
      .insert([{ letter_id: letterId, emoji }]);
    mark("reaction", emoji);
    fetchReactions();
  }

  return (
    <div className="flex items-center gap-1 text-lg select-none">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          className="hover:scale-110 transition rounded hover:bg-pink-50 focus:outline-none px-2"
          onClick={() => handleReact(emoji)}
          disabled={loading || isBlocked("reaction", emoji)}
        >
          {emoji}
          <span className="ml-1 text-xs text-gray-400">
            {(counts[emoji] || 0) > 0 ? counts[emoji] : ""}
          </span>
        </button>
      ))}
    </div>
  );
};

export default EmojiReactionBar;
