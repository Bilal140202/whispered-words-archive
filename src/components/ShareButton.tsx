
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
        if (image) {
          setImgUrl(image);
          setGenerating(false);
          console.log("Image generated from Edge Function:", image.slice(0, 80));
          return image;
        }
      }
    } catch (err) {
      console.log("Failed calling Edge Function", err);
    }

    // 2. Fallback: generate image from DOM using html-to-image
    if (letterRef.current) {
      try {
        // Briefly set visibility to visible to improve chance of capture, then revert.
        const prevVisibility = letterRef.current.style.visibility;
        letterRef.current.style.visibility = 'visible';
        letterRef.current.style.display = "block";
        const dataUrl = await toPng(letterRef.current, {
          cacheBust: true,
          backgroundColor: "#fff5fa",
          pixelRatio: 2,
        });
        letterRef.current.style.visibility = prevVisibility;
        setImgUrl(dataUrl);
        setGenerating(false);
        console.log("Image generated from html-to-image");
        return dataUrl;
      } catch (err) {
        setGenerating(false);
        console.error("Unable to generate image:", err);
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
      } catch (err) {
        // fallback to clipboard below
      }
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

  function LetterRenderForImage() {
    // Most likely to work: display:none breaks, opacity:0 sometimes doesn't render, so use visibility:hidden and pointerEvents:none
    // We also add font loader style inline to help font rendering & force block layout
    return (
      <div
        ref={letterRef}
        style={{
          width: "540px",
          height: "320px",
          background: "#fff5fa",
          borderRadius: "30px",
          padding: "28px 32px",
          fontFamily: '"Inter", "Segoe UI", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          fontSize: "22px",
          color: "#222",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -9999,
          pointerEvents: "none",
          visibility: "hidden", // Don't use opacity here
          boxSizing: "border-box",
          display: "block",
          //outline: "2px dashed #c6f", // Uncomment for debugging placement
        }}
        aria-hidden
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap');
          `}
        </style>
        {/* Watermark, Tag, Text */}
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
            {/* fallback for absent tag */}
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
          {/* fallback if no text */}
          {text ? text : <span style={{color: "#f00"}}>Image not rendered</span>}
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
        {/* Watermark */}
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
      <LetterRenderForImage />
    </div>
  );
};

export default ShareButton;

