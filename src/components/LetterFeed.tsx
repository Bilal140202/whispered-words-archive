
import React, { useEffect, useRef, useState } from "react";
import { getLetters, TagType, Letter } from "@/utils/storage";
import LetterCard from "./LetterCard";
import { Search } from "lucide-react";

const TAGS: TagType[] = ["Love", "Regret", "Goodbye", "Gratitude", "Confession", "Rage", "Closure"];

const PAGE_SIZE = 10;

function sanitize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/gi, " ");
}

const tagColor: Record<TagType, string> = {
  Love: "bg-love text-pink-700",
  Regret: "bg-regret text-indigo-700",
  Goodbye: "bg-goodbye text-sky-700",
  Gratitude: "bg-gratitude text-green-700",
  Confession: "bg-confession text-amber-800",
  Rage: "bg-rage text-rose-700",
  Closure: "bg-closure text-gray-700"
};

const LetterFeed: React.FC<{ refreshToken?: number }> = ({ refreshToken }) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [tagFilter, setTagFilter] = useState<TagType | null>(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const feedRef = useRef<HTMLDivElement>(null);

  // Fetch all letters
  useEffect(() => {
    setLetters(getLetters());
    setVisibleCount(PAGE_SIZE); // reset on new letter
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [refreshToken]);

  // Infinite scroll w/ 100px before end
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    function onScroll() {
      if (
        el.scrollHeight - el.scrollTop <= el.clientHeight + 100 &&
        visibleCount < filteredLetters.length
      ) {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredLetters.length));
      }
    }
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line
  }, [visibleCount, letters, tagFilter, search]);

  // Filter by tag and search
  const filteredLetters = letters.filter((l) =>
    (!tagFilter || l.tag === tagFilter) &&
    (!search || sanitize(l.text).includes(sanitize(search)))
  );

  return (
    <section>
      <div className="max-w-2xl mx-auto mb-3 px-1">
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition border ${!tagFilter ? "ring-2 ring-primary bg-pink-50 text-pink-700 border-pink-100" : "bg-muted text-gray-700 border-gray-200 hover:bg-gray-100"}`}
              onClick={() => setTagFilter(null)}
            >
              All
            </button>
            {TAGS.map((t) => (
              <button
                key={t}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${tagFilter === t ? tagColor[t] + " ring-2 ring-primary border-white" : "bg-muted text-gray-700 border-gray-200 hover:bg-gray-100"}`}
                onClick={() => setTagFilter(tagFilter === t ? null : t)}
                aria-pressed={tagFilter === t}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-2 sm:mt-0 relative w-full sm:w-56">
            <input
              aria-label="Search letters"
              placeholder="Search letters..."
              className="rounded-full border border-gray-200 px-3 py-2 w-full shadow-sm bg-white focus:ring-2 focus:ring-primary outline-none text-gray-700 pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={64}
            />
            <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>
      <div
        ref={feedRef}
        className="max-w-2xl mx-auto rounded-2xl py-2 overflow-auto"
        style={{ maxHeight: 520, minHeight: 200, scrollbarGutter: "stable" }}
        tabIndex={0}
        aria-label="Public letter feed"
      >
        {filteredLetters.length === 0 ? (
          <div className="text-center text-gray-400 py-6">No letters yet.</div>
        ) : (
          filteredLetters.slice(0, visibleCount).map((letter) => (
            <LetterCard key={letter.id} letter={letter} />
          ))
        )}
        {visibleCount < filteredLetters.length && (
          <div className="text-center py-6 text-xs text-gray-400 animate-pulse">Loading more...</div>
        )}
      </div>
    </section>
  );
};

export default LetterFeed;
