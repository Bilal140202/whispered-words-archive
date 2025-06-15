import React, { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useInteractionBlock } from "@/hooks/useInteractionBlock";

// Helper to escape user content (defense in depth)
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  letterId: string;
};

const supabaseEdgeUrl = "https://hvhmidzgohpxtkqgvndm.supabase.co/functions/v1";

const CommentSheet: React.FC<Props> = ({ open, onOpenChange, letterId }) => {
  const [comments, setComments] = useState<{id: string, comment: string, created_at: string}[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isBlocked, mark } = useInteractionBlock(letterId);

  async function fetchComments() {
    try {
      const { data, error: fetchError } = await supabase
        .from("letter_comments")
        .select("*")
        .eq("letter_id", letterId)
        .order("created_at", { ascending: true });
      setComments(data || []);
      setError(fetchError ? "Failed to load comments" : null);
      console.log("[CommentSheet] fetchComments", { letterId, data, fetchError });
    } catch (e) {
      setError("Failed to load comments");
      console.error("[CommentSheet] fetchComments error", e);
    }
  }

  useEffect(() => {
    if (open) fetchComments();
  }, [open, letterId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (isBlocked("comment")) {
      setError("You have already commented on this letter.");
      return;
    }
    setError(null);
    setSubmitting(true);
    if (newComment.trim().length > 240) {
      setError("Comment must be 240 characters or less.");
      setSubmitting(false);
      return;
    }
    try {
      // Use full URL for Supabase Edge Function
      const resp = await fetch(`${supabaseEdgeUrl}/interaction-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterId, action: "comment" }),
      });
      const data = await resp.json();
      console.log("[CommentSheet] interaction-guard response", resp.status, data);

      if (!resp.ok) {
        setError(data.reason || "Spam filter: Limit reached.");
        setSubmitting(false);
        return;
      }
      // Continue only if ok
      const { error: insertError } = await supabase
        .from("letter_comments")
        .insert([{ letter_id: letterId, comment: newComment.trim() }]);
      if (insertError) {
        setError("Failed to post comment. " + insertError.message);
        setSubmitting(false);
        return;
      }
      mark("comment");
      setNewComment("");
      setSubmitting(false);
      setError(null);
      fetchComments();
    } catch (e: any) {
      setError("Error posting comment: " + e.message);
      setSubmitting(false);
      console.error("[CommentSheet] handleSend", e);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-md mx-auto w-full bg-white rounded-t-2xl pt-8 px-2 pb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Comments</h3>
        <div className="space-y-3 mb-3 max-h-60 overflow-auto px-1">
          {comments.length === 0 ? (
            <div className="text-xs text-gray-400 text-center">No comments yet. Be the first to say something.</div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-700 shadow-sm">
                <span
                  dangerouslySetInnerHTML={{ __html: escapeHtml(c.comment) }}
                />
                <div className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 mt-3">
          <input
            value={newComment}
            onChange={e => {
              setError(null);
              setNewComment(e.target.value);
            }}
            className="flex-1 border rounded-lg py-2 px-3 focus:outline-none focus:ring-pink-200 text-gray-700"
            placeholder="Write a comment…"
            maxLength={240}
            required
            disabled={submitting}
            aria-describedby="comment-help"
          />
          <button
            type="submit"
            className="bg-pink-400 text-white font-semibold px-4 py-2 rounded-lg hover:bg-pink-500 transition"
            disabled={submitting || !newComment.trim()}
          >
            Send
          </button>
        </form>
        {error && (
          <div className="text-xs text-red-600 mt-2 px-2">{error}</div>
        )}
        <div className="text-xs text-gray-400 mt-1" id="comment-help">
          Max 240 characters. Offensive content will be removed.
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentSheet;
