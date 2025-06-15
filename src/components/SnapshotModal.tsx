
import React, { useRef, useEffect } from "react";

type SnapshotModalProps = {
  open: boolean;
  onRendered: (node: HTMLDivElement) => void;
  text: string;
  tag: string | null;
};

const SnapshotModal: React.FC<SnapshotModalProps> = ({
  open,
  onRendered,
  text,
  tag,
}) => {
  const snapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && snapRef.current) {
      document.fonts.ready.then(() => {
        setTimeout(() => {
          if (snapRef.current) {
            onRendered(snapRef.current);
          }
        }, 80);
      });
    }
  }, [open, onRendered]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      style={{ animation: "fadein .16s linear" }}
      aria-modal="true"
      aria-label="Snapshot overlay"
    >
      <div
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
};

export default SnapshotModal;
