
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
  const { isBlocked, mark } = useInteractionBlock(letterId);

  async function fetchReactions() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("letter_reactions")
        .select("emoji, count:emoji")
        .eq("letter_id", letterId);

      const emojiCounts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        emojiCounts[row.emoji] = (emojiCounts[row.emoji] ?? 0) + 1;
      });
      setCounts(emojiCounts);
      setLoading(false);
      setError(null);
      console.log("[EmojiReactionBar] fetchReactions", { letterId, emojiCounts, data });
    } catch (e) {
      setLoading(false);
      setError("Failed to load reactions");
      toast({ title: "Fetch reactions failed", description: String(e), variant: "destructive" });
      console.error("[EmojiReactionBar] fetchReactions err", e);
    }
  }

  useEffect(() => {
    fetchReactions();
  }, [letterId]);

  async function handleReact(emoji: string) {
    console.log("[EmojiReactionBar] handleReact", { letterId, emoji });
    if (isBlocked("reaction", emoji)) {
      setError("Already reacted with this emoji!");
      toast({ title: "Reaction blocked", description: "Already reacted with this emoji!", variant: "destructive" });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = { letterId, action: "reaction", emoji };
      console.log("[EmojiReactionBar] Sending to edge", body);
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
      const { error: supaError } = await supabase
        .from("letter_reactions")
        .insert([{ letter_id: letterId, emoji }]);
      if (supaError) {
        setError("Failed to record reaction: " + supaError.message);
        toast({ title: "Reaction failed", description: supaError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      mark("reaction", emoji);
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
      {error && (
        <span className="ml-2 text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default EmojiReactionBar;
