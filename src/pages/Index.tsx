
import React, { useState } from "react";
import LetterForm from "@/components/LetterForm";
import LetterFeed from "@/components/LetterFeed";

const Index = () => {
  const [refreshToken, setRefreshToken] = useState(0);

  function handleFormSubmit() {
    setRefreshToken((r) => r + 1);
  }

  return (
    <main className="min-h-screen flex flex-col px-4 py-8 sm:py-12 bg-[linear-gradient(119deg,#fff5fa_0%,#f6f6ff_100%)]">
      {/* Title */}
      <header className="flex flex-col items-center mb-10">
        <h1 className="font-handwritten text-5xl md:text-6xl text-pink-400 mb-2 tracking-wide drop-shadow-sm text-center">UnsentLetters</h1>
        <h2 className="text-base md:text-lg text-gray-400 italic mb-2 text-center">Say What You Never Could</h2>
        <p className="text-gray-500 text-sm md:text-base max-w-xl text-center">
          Write and read anonymous unsent letters in a gentle, safe space. Your letters are never associated with you. Express, release, and be heard.<br className="hidden md:block" />
          <span className="text-xs text-gray-400 block mt-2">⚡️ No login or signup – all letters are stored only in your browser!</span>
        </p>
      </header>
      {/* Letter Composer */}
      <LetterForm onSubmit={handleFormSubmit} />
      {/* Diary Feed */}
      <LetterFeed refreshToken={refreshToken} />
      <footer className="text-center text-xs text-gray-300 mt-12 py-3">
        &copy; {new Date().getFullYear()} UnsentLetters &mdash; A Lovable Project.
      </footer>
    </main>
  );
};

export default Index;
