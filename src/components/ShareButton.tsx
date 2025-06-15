
import React, { useRef, useState } from "react";
import { Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";

type Props = { letterId: string; text: string; tag: string | null };

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://unsentletters.lovable.app";

const ShareButton: React.FC<Props> = ({ letterId, text, tag }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Create a hidden letter DOM node for html-to-image fallback
  const letterRef = useRef<HTMLDivElement | null>(null);

  // Generates an image of the letter and returns its URL
  async function generateImage() {
    setGenerating(true);
    setImgUrl(null);
    // 1. Try from backend Edge Function (SVG/PNG)
    try {
      const res = await fetch(`/functions/letter-image?letterId=${encodeURIComponent(letterId)}`);
      if (res.ok) {
        const { image } = await res.json();
        setImgUrl(image);
        setGenerating(false);
        return image;
      }
    } catch (err) {
      // backend/image API failed, fall back to front-end below
    }

    // 2. Fallback: generate image from DOM using html-to-image
    if (letterRef.current) {
      try {
        const dataUrl = await toPng(letterRef.current, { cacheBust: true });
        setImgUrl(dataUrl);
        setGenerating(false);
        return dataUrl;
      } catch {
        setGenerating(false);
        toast({
          title: "Image Error",
          description: "Unable to generate image.",
          variant: "destructive"
        });
        return null;
      }
    } else {
      setGenerating(false);
      toast({
        title: "Image Error",
        description: "Unable to access letter for image.",
        variant: "destructive"
      });
      return null;
    }
  }

  // Main click handler for unified share
  async function handleShare() {
    setGenerating(true);
    setImgUrl(null);

    // 1. Generate image (try backend, fallback to frontend)
    const imageUrl = await generateImage();

    // 2. Compose deep link (direct to the letter)
    const letterUrl = `${BASE_URL}/?letter=${encodeURIComponent(letterId)}`;

    // 3. Try Native Web Share API if available (shares image+text+link)
    if (imageUrl && (navigator.canShare?.({ url: letterUrl }) || navigator.canShare?.({ files: [] }))) {
      try {
        // Fetch the image blob for sharing (for mobile share sheets)
        let imageBlob: Blob;
        if (imageUrl.startsWith("data:")) {
          // Data URL, convert to Blob
          const res = await fetch(imageUrl);
          imageBlob = await res.blob();
        } else {
          // Regular URL, fetch as blob
          const response = await fetch(imageUrl);
          imageBlob = await response.blob();
        }

        const filesArray = [
          new File([imageBlob], `unsentletter-${letterId}.png`, { type: imageBlob.type || "image/png" }),
        ];

        const shareData: any = {
          title: "UnsentLetter",
          text: `"${text}"\n\nRead/comment: ${letterUrl}`,
          files: filesArray,
          url: letterUrl,
        };
        await navigator.share(shareData);
        setGenerating(false);
        toast({
          title: "Shared!",
          description: "Your letter was shared successfully.",
          variant: "default",
        });
        return;
      } catch (err) {
        // If sharing failed, fallback to clipboard & download
      }
    }

    // 4. Fallback: Copy letter link to clipboard, show image for download
    try {
      await navigator.clipboard.writeText(letterUrl);
      toast({
        title: "Link copied!",
        description: "Link copied. Download the image below or share it anywhere!",
        variant: "default",
      });
    } catch {
      toast({
        title: "Share info",
        description: "Couldn't access clipboard. Download the image below.",
        variant: "default",
      });
    }
    setGenerating(false);
    setImgUrl(imageUrl);
  }

  // Renders an invisible copy of the letter used for html-to-image fallback.
  // Designed to match the letter card style visually.
  function LetterRenderForImage() {
    return (
      <div
        ref={letterRef}
        className="w-[540px] h-[320px] bg-[#fff5fa] rounded-[30px] px-8 py-7 font-sans text-[22px] relative shrink-0 text-gray-900"
        style={{
          position: "fixed",
          top: 0,
          left: '-10000px',
          zIndex: -999,
          pointerEvents: "none",
          opacity: 0,
        }}
        aria-hidden // don't expose to screen readers
      >
        {tag && (
          <span className="absolute left-7 top-6 text-[32px] font-handwritten text-pink-500">
            {tag}
          </span>
        )}
        <div className="mt-14 mb-2 whitespace-pre-line break-words min-h-[90px]">
          {text}
        </div>
        <div className="absolute bottom-8 left-7 text-[18px] text-[#ad8cca]">Anonymous</div>
        <div className="absolute bottom-6 right-12 text-[12px] text-[#e6acd7]">unsentletters.app</div>
        <div className="absolute top-4 right-8">
          <svg width="40" height="40" fill="none"><rect x="3" y="8" width="30" height="18" rx="4" fill="#FFD5EC"/><path d="M5 10l15 11 15-11" stroke="#EA4CA9" strokeWidth="1.2" /><circle cx="18" cy="25" r="3" fill="#EA4CA9" fillOpacity="0.09"/></svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center gap-1 rounded px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
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
      {/* Hidden render for html-to-image fallback */}
      <LetterRenderForImage />
    </div>
  );
};

export default ShareButton;
