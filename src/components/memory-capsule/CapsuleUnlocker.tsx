
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CapsuleCountdown from "./CapsuleCountdown";
import CapsuleReveal from "./CapsuleReveal";

const CapsuleUnlocker = ({ capsuleId }: { capsuleId: string }) => {
  const [loading, setLoading] = useState(true);
  const [capsule, setCapsule] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCapsule() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("memory_capsules")
        .select("*")
        .eq("id", capsuleId)
        .maybeSingle();
      if (error || !data) {
        setError("Memory Capsule not found.");
      } else {
        setCapsule(data);
      }
      setLoading(false);
    }
    fetchCapsule();
  }, [capsuleId]);

  if (loading) return <div className="text-center py-8 text-lg">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!capsule) return null;

  const now = Date.now();
  const unlockTime = new Date(capsule.unlock_date).getTime();

  if (capsule.is_unlocked || now >= unlockTime) {
    return <CapsuleReveal capsule={capsule} />;
  }

  return (
    <CapsuleCountdown
      unlockDate={capsule.unlock_date}
      content={
        <div className="flex flex-col items-center py-8">
          <div className="font-serif text-lg text-gray-600 mb-3 text-center">
            This capsule is locked until: <br />
            <span className="font-bold text-pink-500">{new Date(capsule.unlock_date).toLocaleString()}</span>
          </div>
        </div>
      }
    />
  );
};

export default CapsuleUnlocker;
