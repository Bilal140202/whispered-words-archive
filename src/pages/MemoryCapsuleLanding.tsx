
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MemoryCapsuleLanding: React.FC = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <section className="rounded-xl shadow-xl p-8 md:p-16 backdrop-blur-lg bg-white/60 border border-white/50 max-w-md mx-auto text-center animate-fade-in">
        <h1 className="font-serif font-semibold text-3xl md:text-4xl mb-3 tracking-wide text-purple-800">
          Memory Capsule
        </h1>
        <p className="text-base md:text-lg text-gray-500 mb-6">
          Save a cherished memory, photo, or message in a digital time capsule.<br />
          Your memory stays locked and safe until your chosen future day.
        </p>
        <Button
          variant="secondary"
          className="w-full font-serif text-lg py-3 bg-pink-100 hover:bg-pink-200/80 text-pink-700 shadow hover-scale transition"
          onClick={() => navigate("/memory-capsule/create")}
        >
          Lock a Memory
        </Button>
        <Button
          variant="ghost"
          className="block w-full mt-4 text-purple-700 underline text-sm"
          onClick={() => navigate("/memory-capsule/feed")}
        >
          See Public Capsules
        </Button>
      </section>
    </main>
  );
};

export default MemoryCapsuleLanding;
