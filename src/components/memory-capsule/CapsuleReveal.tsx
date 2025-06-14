
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CapsuleReveal: React.FC<{ capsule: any }> = ({ capsule }) => {
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    if (!capsule.is_unlocked) {
      // Mark as unlocked once revealed
      supabase
        .from("memory_capsules")
        .update({ is_unlocked: true, unlocked_at: new Date().toISOString() })
        .eq("id", capsule.id)
        .then();
    }
    const timer = setTimeout(() => setOpening(false), 1500); // Unlock animation 1.5s
    return () => clearTimeout(timer);
  }, [capsule.id, capsule.is_unlocked]);

  return (
    <div>
      {opening ? (
        <div className="flex flex-col items-center justify-center py-16 animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 via-purple-200 to-blue-200 blur-md opacity-80"></div>
          <div className="absolute text-5xl font-serif text-pink-500">🔒</div>
          <div className="mt-6 text-lg text-pink-500 font-semibold font-serif animate-fade-in">
            Opening capsule...
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-purple-100 mb-2 text-center flex items-center justify-center">
            <span className="text-3xl">📬</span>
          </div>
          <h2 className="font-serif text-xl text-purple-900 mb-4">Unlocked Memory Capsule</h2>
          <div className="whitespace-pre-wrap text-gray-700 bg-white/80 rounded shadow px-4 py-4 mb-3 font-serif">{capsule.content}</div>
          {/* Show media if exists */}
          {capsule.image_url && (
            <img src={capsule.image_url} alt="capsule attachment" className="max-w-full rounded-lg mb-3 border shadow" />
          )}
          {capsule.audio_url && (
            <audio controls className="w-full mb-2">
              <source src={capsule.audio_url} />
              Your browser does not support the audio element.
            </audio>
          )}
          {capsule.video_url && (
            <video src={capsule.video_url} controls className="w-full mb-2 rounded-lg" />
          )}
          <div className="text-xs text-gray-400 mb-1">
            Locked on: {new Date(capsule.created_at).toLocaleString()}
            <br />
            Unlocked: {capsule.unlocked_at ? new Date(capsule.unlocked_at).toLocaleString() : new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CapsuleReveal;
