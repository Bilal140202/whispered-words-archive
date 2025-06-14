
import React, { useState } from "react";
import { Share2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Props = { letterId: string; text: string; tag: string | null };

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://unsentletters.lovable.app";

const ShareButton: React.FC<Props> = ({ letterId, text, tag }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function generateImage() {
    setGenerating(true);
    setImgUrl(null);
    const res = await fetch(`/functions/letter-image?letterId=${encodeURIComponent(letterId)}`);
    if (!res.ok) {
      toast({
        title: "Image Error",
        description: "Failed to generate share image.",
        variant: "destructive"
      });
      setGenerating(false);
      return;
    }
    const { image } = await res.json();
    setImgUrl(image);
    setGenerating(false);
  }

  function handleShare() {
    const url = `${BASE_URL}/?letter=${encodeURIComponent(letterId)}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Link to this letter has been copied.",
      variant: "default"
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className="flex items-center gap-1 rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
        type="button"
        aria-label="Share letter"
        onClick={handleShare}
      >
        <Share2 className="w-5 h-5" />
        <span className="text-xs">Share</span>
      </button>
      <button
        className="flex items-center gap-1 rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
        type="button"
        aria-label="Share image"
        onClick={generateImage}
        disabled={generating}
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-xs">{generating ? "Making..." : "Image"}</span>
      </button>
      {imgUrl && (
        <a href={imgUrl} download={`unsentletter-${letterId}.png`} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-pink-400 text-xs">
          Download image
        </a>
      )}
    </div>
  );
};

export default ShareButton;
