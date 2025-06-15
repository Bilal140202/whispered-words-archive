import React, { useRef, useState } from "react";
import { Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";
import SnapshotModal from "./SnapshotModal";

type Props = { letterId: string; text: string; tag: string | null };

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://unsentletters.lovable.app";

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
