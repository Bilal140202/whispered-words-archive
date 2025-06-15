
import { useCallback } from "react";

// Blocker is disabled to allow all actions
export function useInteractionBlock(letterId: string) {
  // Always return false (never blocked)
  const isBlocked = useCallback(
    (_action: "comment" | "like" | "reaction", _emoji?: string) => {
      return false;
    },
    [letterId]
  );

  // Disabled (no-op)
  const mark = useCallback(
    (_action: "comment" | "like" | "reaction", _emoji?: string) => {},
    [letterId]
  );

  return { isBlocked, mark };
}
