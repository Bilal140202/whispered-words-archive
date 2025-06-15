
import { useCallback } from "react";

// LocalStorage keys: "ul_cmt_{letterId}", "ul_react_{letterId}_{emoji?}"
export function useInteractionBlock(letterId: string) {
  function deviceKey(action: "comment" | "like" | "reaction", emoji?: string) {
    return action === "reaction"
      ? `ul_react_${letterId}_${emoji}`
      : `ul_${action}_${letterId}`;
  }

  // Returns true if already interacted (per device)
  const isBlocked = useCallback(
    (action: "comment" | "like" | "reaction", emoji?: string) => {
      const key = deviceKey(action, emoji);
      const value = localStorage.getItem(key);
      console.log("[useInteractionBlock] isBlocked", { action, emoji, key, value });
      return !!value;
    },
    [letterId]
  );

  // Mark as done
  const mark = useCallback(
    (action: "comment" | "like" | "reaction", emoji?: string) => {
      const key = deviceKey(action, emoji);
      localStorage.setItem(key, "1");
      console.log("[useInteractionBlock] mark", { action, emoji, key });
    },
    [letterId]
  );

  return { isBlocked, mark };
}
