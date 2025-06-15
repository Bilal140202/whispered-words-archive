import React, { useRef, useState } from "react";
import { Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";

type Props = { letterId: string; text: string; tag: string | null };

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://unsentletters.lovable.app";

const ShareButton: React.FC<Props> = ({ letterId, text, tag }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const letterRef = useRef<HTMLDivElement | null>(null);

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
    } catch (err) {}

    // 2. Fallback: generate image from DOM using html-to-image with correct watermark and hidden fallback
    if (letterRef.current) {
      try {
        const dataUrl = await toPng(letterRef.current, {
          cacheBust: true,
          backgroundColor: "#fff5fa", // explicit light pink background!
          pixelRatio: 2,
        });
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

  async function handleShare() {
    setGenerating(true);
    setImgUrl(null);

    const imageUrl = await generateImage();

    const letterUrl = `${BASE_URL}/?letter=${encodeURIComponent(letterId)}`;

    if (imageUrl && (navigator.canShare?.({ url: letterUrl }) || navigator.canShare?.({ files: [] }))) {
      try {
        let imageBlob: Blob;
        if (imageUrl.startsWith("data:")) {
          const res = await fetch(imageUrl);
          imageBlob = await res.blob();
        } else {
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
      } catch (err) {}
    }

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

  // Much more robust: Use only inline styles for share image!
  function LetterRenderForImage() {
    // This div is "visibility: hidden" but always "display: block" so it's actually rendered in DOM flow for html-to-image.
    return (
      <div
        ref={letterRef}
        style={{
          width: "540px",
          height: "320px",
          background: "#fff5fa",
          borderRadius: "30px",
          padding: "28px 32px",
          fontFamily:
            '"Inter", "Segoe UI", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          fontSize: "22px",
          color: "#222",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -999,
          pointerEvents: "none",
          display: "block",
          visibility: "hidden", // NOT opacity 0 or left -10000, so it gets rendered!
          boxSizing: "border-box",
        }}
        aria-hidden
      >
        {tag && (
          <span
            style={{
              position: "absolute",
              left: "28px",
              top: "24px",
              fontSize: "32px",
              fontFamily: '"Shadows Into Light", cursive, sans-serif',
              color: "#EA4CA9",
            }}
          >
            {tag}
          </span>
        )}
        <div
          style={{
            marginTop: "56px",
            marginBottom: "8px",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            minHeight: "90px",
            color: "#222",
            fontSize: "22px",
            lineHeight: 1.45,
          }}
        >
          {text}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "28px",
            fontSize: "18px",
            color: "#ad8cca",
            fontFamily: "inherit",
          }}
        >
          Anonymous
        </div>
        {/* NEW: Always watermark, bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "28px",
            fontSize: "15px",
            color: "#e6acd7",
            fontFamily: "monospace",
            opacity: 0.83,
            textShadow: "1px 1px 3px #fff5fa",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          unsentletters.app
        </div>
        {/* Envelope SVG remains */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "32px",
          }}
        >
          <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="8" width="30" height="18" rx="4" fill="#FFD5EC"/>
            <path d="M5 10l15 11 15-11" stroke="#EA4CA9" strokeWidth="1.2" />
            <circle cx="18" cy="25" r="3" fill="#EA4CA9" fillOpacity="0.09"/>
          </svg>
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
