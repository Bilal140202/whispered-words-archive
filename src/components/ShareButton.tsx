import React, { useState } from "react";
import { Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Props = { letterId: string; text: string; tag: string | null };

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://unsentletters.lovable.app";

const ShareButton: React.FC<Props> = ({ letterId, text, tag }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Generates an image of the letter and returns its URL
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
      return null;
    }
    const { image } = await res.json();
    setImgUrl(image);
    setGenerating(false);
    return image;
  }

  // Main click handler for unified share
  async function handleShare() {
    setGenerating(true);
    setImgUrl(null);

    // 1. Generate image
    const imageUrl = await generateImage();

    // 2. Compose link to the actual letter (deep link)
    // Uses the homepage with letter param as before
    const letterUrl = `${BASE_URL}/?letter=${encodeURIComponent(letterId)}`;

    // 3. Try Native Web Share API if available (shares image+text+link)
    if (imageUrl && (navigator.canShare?.({ url: letterUrl }) || navigator.canShare?.({ files: [] }))) {
      try {
        // Fetch the image blob for sharing (for mobile share sheets)
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();
        const filesArray = [
          new File([imageBlob], `unsentletter-${letterId}.png`, { type: imageBlob.type }),
        ];

        const shareData: any = {
          title: "UnsentLetter",
          text: `"${text}"\n\nRead/comment: ${letterUrl}`,
          files: filesArray,
          url: letterUrl, // fallback for some Web Share implementations
        };
        await navigator.share(shareData);
        setGenerating(false);
        toast({
          title: "Shared!",
          description: "Your letter was shared successfully.",
          variant: "default"
        });
        return;
      } catch (err) {
        // If sharing failed, fallback to clipboard
      }
    }

    // 4. Fallback: Copy letter link to clipboard, and show image for download
    try {
      await navigator.clipboard.writeText(letterUrl);
      toast({
        title: "Link copied!",
        description: "Link to this letter has been copied. Download the image below or share it anywhere!",
        variant: "default"
      });
    } catch {
      toast({
        title: "Share info",
        description: "Couldn't access clipboard. Download the image below.",
        variant: "default"
      });
    }
    setGenerating(false);
    setImgUrl(imageUrl);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center gap-1 rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
        type="button"
        aria-label="Share letter"
        onClick={handleShare}
        disabled={generating}
      >
        <Share className="w-5 h-5" />
        <span className="text-xs">{generating ? "Sharing..." : "Share"}</span>
      </button>
      {imgUrl && (
        <a
          href={imgUrl}
          download={`unsentletter-${letterId}.png`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pink-400 text-xs ml-2"
        >
          Download image
        </a>
      )}
    </div>
  );
};

export default ShareButton;
