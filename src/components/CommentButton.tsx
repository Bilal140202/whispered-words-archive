
import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = { letterId: string; onShowComments: () => void };

const CommentButton: React.FC<Props> = ({ letterId, onShowComments }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchCount();
  // eslint-disable-next-line
  }, [letterId]);

  async function fetchCount() {
    const { count } = await supabase
      .from("letter_comments")
      .select("*", { count: "exact", head: true })
      .eq("letter_id", letterId);
    setCount(count ?? 0);
  }

  return (
    <button
      className="flex items-center gap-1 rounded px-2 py-1 text-sky-600 hover:bg-sky-50 transition"
      type="button"
      aria-label="Comment on letter"
      onClick={onShowComments}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-xs">{count}</span>
    </button>
  );
};

export default CommentButton;
