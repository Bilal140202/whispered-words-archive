
export type Letter = {
  id: string;
  text: string;
  tag: TagType | null;
  createdAt: number;
};
export type TagType = "Love" | "Regret" | "Goodbye" | "Gratitude" | "Confession" | "Rage" | "Closure";

const STORAGE_KEY = "unsent_letters";

export function getLetters(): Letter[] {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  try {
    const arr = JSON.parse(json) as Letter[];
    return Array.isArray(arr)
      ? arr.filter((x) => typeof x.text === "string" && typeof x.createdAt === "number")
      : [];
  } catch {
    return [];
  }
}

export function saveLetter(letter: Letter) {
  const arr = getLetters();
  arr.unshift(letter);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(0, 200)));
}
