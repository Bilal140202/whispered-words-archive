
import React, { useEffect, useState } from "react";

const CapsuleCountdown: React.FC<{
  unlockDate: string;
  content: React.ReactNode;
}> = ({ unlockDate, content }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    return Math.max(0, Math.floor((new Date(unlockDate).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.floor((new Date(unlockDate).getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [unlockDate, secondsLeft]);

  if (secondsLeft <= 0) {
    window.location.reload(); // Capsule is unlocked, re-fetch to display
    return null;
  }

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const mins = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="flex flex-col items-center animate-fade-in delay-200">
      <div className="text-3xl font-serif text-pink-600 my-2">⏳</div>
      <div className="font-mono text-lg flex gap-2 items-center">
        <span>{days}d</span>
        <span>{hours}h</span>
        <span>{mins}m</span>
        <span>{secs}s</span>
      </div>
      <div className="mt-5">{content}</div>
    </div>
  );
};

export default CapsuleCountdown;
