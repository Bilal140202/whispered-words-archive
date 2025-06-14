
import React from "react";
import CapsuleFeedList from "@/components/memory-capsule/CapsuleFeedList";

const CapsuleFeed = () => (
  <main className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 pb-24">
    <section className="max-w-2xl mx-auto p-4 md:p-10 animate-fade-in">
      <h1 className="font-serif text-2xl md:text-3xl mb-4 text-pink-700 font-semibold text-center">
        Public Memory Capsule Feed
      </h1>
      <CapsuleFeedList />
    </section>
  </main>
);

export default CapsuleFeed;
