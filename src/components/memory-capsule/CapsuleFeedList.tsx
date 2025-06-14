
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CapsuleFeedList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("memory_capsules")
        .select("*")
        .eq("allow_public_sharing", true)
        .eq("is_unlocked", true)
        .order("unlock_date", { ascending: false })
        .limit(50);
      if (error) setError(error.message);
      else setCapsules(data || []);
      setLoading(false);
    }
    fetchFeed();
  }, []);

  if (loading) return <div className="text-center py-12 text-lg">Loading feed...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!capsules.length) return <div className="text-center py-12 text-gray-400">No public unlocked capsules yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {capsules.map(capsule => (
        <div key={capsule.id} className="rounded-lg shadow bg-white/80 p-4 border overflow-hidden animate-fade-in">
          <div className="font-serif text-lg text-pink-700 mb-2">📝</div>
          <div className="whitespace-pre-wrap text-gray-800 font-serif text-base mb-1">{capsule.content}</div>
          {capsule.image_url && (
            <img src={capsule.image_url} alt="capsule attachment" className="max-w-full rounded-lg mb-1 border" />
          )}
          {capsule.audio_url && (
            <audio controls className="w-full mb-1">
              <source src={capsule.audio_url} />
              Your browser does not support the audio element.
            </audio>
          )}
          {capsule.video_url && (
            <video src={capsule.video_url} controls className="w-full mb-1 rounded-lg" />
          )}
          <div className="text-xs text-gray-400">
            Unlocked: {capsule.unlocked_at ? new Date(capsule.unlocked_at).toLocaleString() : ""}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CapsuleFeedList;
