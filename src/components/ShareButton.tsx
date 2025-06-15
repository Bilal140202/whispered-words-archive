
import React, { useRef, useState } from "react";
import { Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";

type Props = { letterId: string; text: string; tag: string | null };

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://unsentletters.lovable.app";

// (NEW) Modal overlay component for visible snapshot
function SnapshotModal({
  open,
  onRendered,
  text,
  tag,
}: {
  open: boolean;
  onRendered: (node: HTMLDivElement) => void;
  text: string;
  tag: string | null;
}) {
  const snapRef = useRef<HTMLDivElement | null>(null);

  // Fire when visible, allow paint
  React.useEffect(() => {
    if (open && snapRef.current) {
      // Wait for font load & next frame to ensure styles settle
      document.fonts.ready.then(() => {
        setTimeout(() => {
          if (snapRef.current) {
            onRendered(snapRef.current);
          }
        }, 80); // allow browser to paint the visible DOM at least one frame
      });
    }
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      style={{ animation: "fadein .16s linear" }}
      aria-modal="true"
      aria-label="Snapshot overlay"
    >
      <div // The actual image area, visible and styled as in html
        ref={snapRef}
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
          position: "relative",
          boxSizing: "border-box",
        }}
        tabIndex={-1}
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap');
          `}
        </style>
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
          {text ? text : <span style={{ color: "#f00" }}>Image not rendered</span>}
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
            <rect x="3" y="8" width="30" height="18" rx="4" fill="#FFD5EC" />
            <path d="M5 10l15 11 15-11" stroke="#EA4CA9" strokeWidth="1.2" />
            <circle cx="18" cy="25" r="3" fill="#EA4CA9" fillOpacity="0.09" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const ShareButton: React.FC<Props> = ({ letterId, text, tag }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  // For debugging, reveal canvas on screen
  // Remove all hidden DOM node code!

  // Try Edge Function
  async function generateImageViaEdge(): Promise<string | null> {
    try {
      // Use new-style full path for Edge Function for production
      const URL_BASE =
        typeof window !== "undefined"
          ? `${window.location.origin.replace(/^http/, "https")}/functions`
          : "https://unsentletters.lovable.app/functions";
      // Prefer correct full path, fallback otherwise
      const functionUrl = `/functions/letter-image?letterId=${encodeURIComponent(letterId)}`;
      const res = await fetch(functionUrl, { method: "GET" });
      if (res.ok) {
        const { image } = await res.json();
        if (image && typeof image === "string" && image.startsWith("data:image")) {
          setImgUrl(image);
          setGenerating(false);
          console.log("Image generated from Edge Function:", image.slice(0, 80));
          return image;
        }
      } else {
        console.log("Edge Function error", res.status, await res.text());
      }
    } catch (err) {
      console.log("Failed calling Edge Function", err);
    }
    return null;
  }

  // Fallback: Show a modal, capture a visible DOM snapshot with html-to-image
  async function generateImageViaModal(): Promise<string | null> {
    return new Promise((resolve) => {
      setShowSnapshotModal(true);
      function onRendered(node: HTMLDivElement) {
        // When the Modal's card is painted, capture it
        toPng(node, {
          cacheBust: true,
          backgroundColor: "#fff5fa",
          pixelRatio: 2,
        })
          .then((dataUrl) => {
            setImgUrl(dataUrl);
            setGenerating(false);
            setShowSnapshotModal(false);
            console.log("Image generated with html-to-image modal, length:", dataUrl.length);
            resolve(dataUrl);
          })
          .catch((err) => {
            setGenerating(false);
            setShowSnapshotModal(false);
            toast({
              title: "Image Error",
              description: "Unable to generate image.",
              variant: "destructive",
            });
            console.log("html-to-image modal failed", err);
            resolve(null);
          });
      }
      // Pass the callback down; the modal will call after font paints
      (SnapshotModal as any).lastOnRendered = onRendered;
    });
  }

  async function generateImage() {
    setGenerating(true);
    setImgUrl(null);

    // 1. Try backend Edge Function (fastest, best for bots/sharing links)
    const edgeImg = await generateImageViaEdge();
    if (edgeImg) {
      setGenerating(false);
      return edgeImg;
    }

    // 2. Fallback: use html-to-image on visible modal overlay!
    const modalImg = await generateImageViaModal();
    setGenerating(false);
    return modalImg;
  }

  async function handleShare() {
    setGenerating(true);
    setImgUrl(null);

    const imageUrl = await generateImage();

    const letterUrl = `${BASE_URL}/?letter=${encodeURIComponent(letterId)}`;

    // Try system share API
    if (
      imageUrl &&
      (navigator.canShare?.({ url: letterUrl }) || navigator.canShare?.({ files: [] }))
    ) {
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
          new File([imageBlob], `unsentletter-${letterId}.png`, {
            type: imageBlob.type || "image/png",
          }),
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
        // fallback below
        console.log("Web Share API failed, falling back", err);
      }
    }

    // Clipboard fallback for link
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

  // Pass the onRendered handler from generateImageViaModal to modal
  const getModalOnRendered = () => {
    return (SnapshotModal as any).lastOnRendered
      ? (SnapshotModal as any).lastOnRendered
      : () => {};
  };

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
      {/* Show snapshot modal only while generating */}
      <SnapshotModal
        open={showSnapshotModal}
        onRendered={getModalOnRendered()}
        text={text}
        tag={tag}
      />
    </div>
  );
};

export default ShareButton;
