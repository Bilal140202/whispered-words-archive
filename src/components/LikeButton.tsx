
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = { letterId: string };

const LikeButton: React.FC<Props> = ({ letterId }) => {
  const [count, setCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function fetchLikes() {
    const { count } = await supabase
      .from("letter_likes")
      .select("*", { count: "exact", head: true })
      .eq("letter_id", letterId);
    setCount(count ?? 0);
  }

  useEffect(() => {
    fetchLikes();
  }, [letterId]);

  async function handleLike() {
    setSubmitting(true);
    await supabase
      .from("letter_likes")
      .insert([{ letter_id: letterId }]);
    setSubmitting(false);
    fetchLikes();
  }

  return (
    <button
      className={`flex items-center gap-1 group rounded px-2 py-1 text-pink-500 ${submitting ? "opacity-60" : ""}`}
      type="button"
      aria-label="Like letter"
      disabled={submitting}
      onClick={handleLike}
    >
      <Heart className={`w-5 h-5 group-hover:fill-pink-200`} />
      <span className="text-xs">{count}</span>
    </button>
  );
};

export default LikeButton;
