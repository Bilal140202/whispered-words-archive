
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInteractionBlock } from "@/hooks/useInteractionBlock";
import { toast } from "@/components/ui/use-toast";

type Props = { letterId: string };

const supabaseEdgeUrl = "https://hvhmidzgohpxtkqgvndm.supabase.co/functions/v1";

const LikeButton: React.FC<Props> = ({ letterId }) => {
  const [count, setCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isBlocked, mark } = useInteractionBlock(letterId);

  async function fetchLikes() {
    try {
      const { count } = await supabase
        .from("letter_likes")
        .select("*", { count: "exact", head: true })
        .eq("letter_id", letterId);
      setCount(count ?? 0);
      setError(null);
      console.log("[LikeButton] fetchLikes", { letterId, count });
    } catch (e) {
      setError("Failed to load likes");
      console.error("[LikeButton] fetchLikes error", e);
    }
  }

  useEffect(() => {
    fetchLikes();
  }, [letterId]);

  async function handleLike() {
    console.log("[LikeButton] handleLike clicked", { letterId });
    if (isBlocked("like")) {
      setError("Already liked!");
      toast({ title: "Like blocked", description: "You've already liked this.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setError(null);
    console.log("[LikeButton] Attempting like", { letterId });

    try {
      const body = { letterId, action: "like" };
      console.log("[LikeButton] Sending to edge", body);
      const resp = await fetch(`${supabaseEdgeUrl}/interaction-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      console.log("[LikeButton] interaction-guard response", resp.status, data);

      if (!resp.ok) {
        setSubmitting(false);
        setError(data.reason || "Spam protection: Like not allowed");
        toast({ title: "Like failed", description: data.reason || "Spam protection: Like not allowed", variant: "destructive" });
        return;
      }
      const { error: supaError } = await supabase
        .from("letter_likes")
        .insert([{ letter_id: letterId }]);
      if (supaError) {
        setError("Failed to record like: " + supaError.message);
        toast({ title: "Like failed", description: supaError.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      mark("like");
      setSubmitting(false);
      fetchLikes();
      setError(null);
      toast({ title: "Like succeeded", description: "Your like was added!" });
    } catch (e: any) {
      setError("Error submitting like: " + e.message);
      setSubmitting(false);
      toast({ title: "Like failed", description: e.message, variant: "destructive" });
      console.error("[LikeButton] handleLike error", e);
    }
  }

  return (
    <button
      className={`flex items-center gap-1 group rounded px-2 py-1 text-pink-500 ${submitting ? "opacity-60" : ""}`}
      type="button"
      aria-label="Like letter"
      disabled={submitting || isBlocked("like")}
      onClick={handleLike}
    >
      <Heart className={`w-5 h-5 group-hover:fill-pink-200`} />
      <span className="text-xs">{count}</span>
      {error && (
        <span className="ml-2 text-xs text-red-500">{error}</span>
      )}
    </button>
  );
};

export default LikeButton;
