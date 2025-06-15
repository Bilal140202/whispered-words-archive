
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInteractionBlock } from "@/hooks/useInteractionBlock";
import { toast } from "@/components/ui/use-toast";

const EMOJIS = ["❤️", "😢", "😡", "😭", "😱", "🤗", "😶"];
type Props = { letterId: string };

const supabaseEdgeUrl = "https://hvhmidzgohpxtkqgvndm.supabase.co/functions/v1";

const EmojiReactionBar: React.FC<Props> = ({ letterId }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isBlocked, mark, unmark } = useInteractionBlock(letterId);
  const [myEmoji, setMyEmoji] = useState<string | null>(null);

  async function fetchReactions() {
    setLoading(true);
    try {
      // Fix: Only select emoji column, then count them per emoji
      const { data, error } = await supabase
        .from("letter_reactions")
        .select("emoji")
        .eq("letter_id", letterId);

      if (error) {
        throw error;
      }

      // Count up per emoji
      const emojiCounts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        emojiCounts[row.emoji] = (emojiCounts[row.emoji] ?? 0) + 1;
      });
      setCounts(emojiCounts);

      // Detect if IP (user) has reacted (by checking anon_interaction_logs for reaction)
      let markedEmoji: string | null = null;

      for (const emoji of EMOJIS) {
        if (isBlocked("reaction", emoji)) {
          markedEmoji = emoji;
          break;
        }
      }
      setMyEmoji(markedEmoji);

      setLoading(false);
      setError(null);
      console.log("[EmojiReactionBar] fetchReactions", { letterId, emojiCounts, data, markedEmoji });
    } catch (e) {
      setLoading(false);
      setError("Failed to load reactions");
      toast({ title: "Fetch reactions failed", description: String(e), variant: "destructive" });
      console.error("[EmojiReactionBar] fetchReactions err", e);
    }
  }

  useEffect(() => {
    fetchReactions();
    // eslint-disable-next-line
  }, [letterId]);

  async function handleReact(emoji: string) {
    console.log("[EmojiReactionBar] handleReact", { letterId, emoji });

    const alreadyReacted = myEmoji === emoji;
    setLoading(true);
    setError(null);

    try {
      const body = { letterId, action: "reaction", emoji };
      console.log("[EmojiReactionBar] Sending to edge", { ...body, alreadyReacted });

      const resp = await fetch(`${supabaseEdgeUrl}/interaction-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      console.log("[EmojiReactionBar] interaction-guard response", resp.status, data);

      if (!resp.ok) {
        setError(data.reason || "Spam protection: Reaction not allowed.");
        toast({ title: "Reaction failed", description: data.reason || "Spam protection: Reaction not allowed.", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (data.undone) {
        // Undo was successful
        unmark("reaction", emoji);
        setMyEmoji(null);
        setLoading(false);
        setError(null);
        fetchReactions();
        toast({ title: "Reaction removed", description: "Your reaction was removed!" });
        return;
      }

      // Reaction succeeded (new one)
      mark("reaction", emoji);
      setMyEmoji(emoji);
      setLoading(false);
      setError(null);
      fetchReactions();
      toast({ title: "Reaction succeeded", description: "Your reaction was added!" });
    } catch (e: any) {
      setLoading(false);
      setError("Error submitting reaction: " + e.message);
      toast({ title: "Reaction failed", description: e.message, variant: "destructive" });
      console.error("[EmojiReactionBar] handleReact error", e);
    }
  }

  return (
    <div className="flex items-center gap-1 text-lg select-none">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          className={`hover:scale-110 transition rounded px-2 focus:outline-none
            ${myEmoji === emoji ? "bg-pink-200/60" : "hover:bg-pink-50"}
          `}
          onClick={() => handleReact(emoji)}
          disabled={loading || (myEmoji !== null && myEmoji !== emoji)}
        >
          {emoji}
          <span className="ml-1 text-xs text-gray-400">
            {counts[emoji] > 0 ? counts[emoji] : ""}
          </span>
        </button>
      ))}
      {error && (
        <span className="ml-2 text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default EmojiReactionBar;

