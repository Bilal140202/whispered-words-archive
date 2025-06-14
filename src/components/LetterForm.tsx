
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TagType } from "@/utils/storage";

const TAGS: TagType[] = ["Love", "Regret", "Goodbye", "Gratitude", "Confession", "Rage", "Closure"];

const tagColor: Record<TagType, string> = {
  Love: "bg-love text-pink-700",
  Regret: "bg-regret text-indigo-700",
  Goodbye: "bg-goodbye text-sky-700",
  Gratitude: "bg-gratitude text-green-700",
  Confession: "bg-confession text-amber-800",
  Rage: "bg-rage text-rose-700",
  Closure: "bg-closure text-gray-700"
};

const MAX = 1000;

const LetterForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const [text, setText] = useState("");
  const [tag, setTag] = useState<TagType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const disabled = text.trim().length === 0 || text.trim().length > MAX || submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) {
      toast({
        title: "Letter can't be empty",
        description: "Please write something before submitting.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    // Insert letter into Supabase
    const { error } = await supabase
      .from("letters")
      .insert([
        {
          text: text.trim(),
          tag: tag ?? null,
          // No user_id—anonymous by default
        },
      ]);
    setSubmitting(false);

    if (error) {
      toast({
        title: "Failed to send letter",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setText("");
    setTag(null);
    toast({
      title: "Letter sent",
      description: "Your letter is now in the diary feed.",
      variant: "default",
    });
    onSubmit();
  }

  return (
    <form
      className="rounded-2xl shadow-diary bg-card p-6 border border-gray-200 max-w-2xl mx-auto mb-10"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <label htmlFor="letter" className="block mb-2 text-lg font-semibold text-gray-700">
        Write your unsent letter:
      </label>
      <textarea
        maxLength={MAX}
        id="letter"
        className="w-full h-40 resize-vertical rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pour out your heart. Your letter is 100% anonymous and will be shared publicly…"
        required
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(tag === t ? null : t)}
              className={`transition px-4 py-1.5 rounded-full text-sm font-bold border border-gray-200 shadow ${
                tag === t
                  ? tagColor[t] + " ring-2 ring-primary"
                  : "bg-muted text-gray-700 hover:bg-gray-100"
              }`}
              aria-pressed={tag === t}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-400 mt-1 sm:mt-0">
          {text.length}/{MAX} characters
        </div>
      </div>
      <button
        disabled={disabled}
        className="mt-6 bg-primary hover:bg-pink-100 text-pink-900 font-bold rounded-lg py-2 px-7 shadow transition min-w-[128px] disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
        type="submit"
      >
        {submitting ? "Sending..." : "Send Letter"}
      </button>
    </form>
  );
};

export default LetterForm;
