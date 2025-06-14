
import React, { useState } from "react";
import LetterFeed from "@/components/LetterFeed";
import AddLetterSheet from "@/components/AddLetterSheet";
import { Plus } from "lucide-react";

const Index = () => {
  const [refreshToken, setRefreshToken] = useState(0);
  const [showSheet, setShowSheet] = useState(false);

  function handleFormSubmit() {
    setRefreshToken((r) => r + 1);
    setShowSheet(false);
  }

  return (
    <main className="relative min-h-screen flex flex-col px-2 py-4 sm:py-10 bg-[linear-gradient(119deg,#fff5fa_0%,#f6f6ff_100%)]">
      {/* Header / Hero */}
      <header className="flex flex-col items-center mb-7 pt-2">
        <div className="flex items-center gap-3 mb-1">
          <span className="inline-block animate-fade-in">
            <svg width={36} height={36} viewBox="0 0 32 32" fill="none">
              {/* Simple envelope/love icon */}
              <rect x="2" y="7" width="28" height="18" rx="4" fill="#FFD5EC" />
              <path d="M4 9l12 9 12-9" stroke="#EA4CA9" strokeWidth="1.5" />
              <circle cx="16" cy="21" r="3" fill="#EA4CA9" fillOpacity="0.07"/>
            </svg>
          </span>
          <h1 className="font-handwritten text-5xl md:text-6xl text-pink-400 tracking-wide drop-shadow-sm text-center select-none animate-fade-in">UnsentLetters</h1>
        </div>
        <h2 className="text-base md:text-lg text-gray-500 italic mb-2 text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Share what you never could say—publicly and anonymously
        </h2>
        <div className="flex items-center gap-2 justify-center my-2">
          <span className="inline-flex items-center bg-pink-100 px-3 py-1 rounded-full text-xs text-pink-700 shadow-sm">
            <svg width={15} height={15} fill="none" className="mr-1"><circle cx={7.5} cy={7.5} r={7} fill="#EA4CA9" fillOpacity={.15} /><path d="M7.5 3.5C9 3.5 10.25 4.57 10.25 5.83c0 1.76-2.17 3.12-2.75 3.37-.58-.25-2.75-1.61-2.75-3.37C4.75 4.57 6 3.5 7.5 3.5Z" fill="#EA4CA9" /></svg>
            100% anonymous – no account or login required
          </span>
          <span className="inline-flex items-center bg-pink-50 px-3 py-1 rounded-full text-xs text-pink-600 shadow-sm">
            <svg width={15} height={15} fill="none" className="mr-1"><rect x={2} y={4} width={11} height={7} rx={2} fill="#FFD5EC"/><path d="M3 5l4.5 3.5L13 5" stroke="#EA4CA9" strokeWidth="1"/></svg>
            Your letter is visible instantly in the public feed
          </span>
        </div>
        <p className="text-gray-400 text-xs text-center max-w-xl mx-auto">
          All letters are public, moderated, and never linked to your identity. <br />
          <span className="font-medium text-pink-500">Express, release, and be heard – safely.</span>
        </p>
      </header>

      {/* Floating Add Letter Button only */}
      <button
        aria-label="Compose new letter"
        className="fixed bottom-6 right-6 z-40 rounded-full bg-pink-400 hover:bg-pink-500 text-white shadow-lg w-16 h-16 flex items-center justify-center transition duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-200"
        onClick={() => setShowSheet(true)}
        style={{boxShadow: "0 8px 28px 0 rgba(234,76,169,0.09), 0 2px 6px 0 rgba(112, 99, 90, 0.10)"}}
      >
        <Plus size={30} />
      </button>

      {/* Add Letter Sheet/Modal */}
      <AddLetterSheet open={showSheet} onOpenChange={setShowSheet} onSubmit={handleFormSubmit} />

      {/* Letter Feed */}
      <div className="mt-2">
        <LetterFeed refreshToken={refreshToken} />
      </div>

      <footer className="text-center text-xs text-gray-300 mt-12 py-3">
        &copy; {new Date().getFullYear()} UnsentLetters &mdash; A Lovable Project.
      </footer>
    </main>
  );
};

export default Index;
