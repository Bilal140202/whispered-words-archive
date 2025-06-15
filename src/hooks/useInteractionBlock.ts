
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
      return !!localStorage.getItem(deviceKey(action, emoji));
    },
    [letterId]
  );

  // Mark as done
  const mark = useCallback(
    (action: "comment" | "like" | "reaction", emoji?: string) => {
      localStorage.setItem(deviceKey(action, emoji), "1");
    },
    [letterId]
  );

  return { isBlocked, mark };
}
