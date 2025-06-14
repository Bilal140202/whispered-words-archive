
import React from "react";
import { useParams } from "react-router-dom";
import CapsuleUnlocker from "@/components/memory-capsule/CapsuleUnlocker";

const UnlockCapsule = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
      <section className="w-full max-w-lg p-4 md:p-10 rounded-xl shadow-xl bg-white/80 border border-white/50 backdrop-blur-xl animate-fade-in">
        <CapsuleUnlocker capsuleId={id!} />
      </section>
    </main>
  );
};

export default UnlockCapsule;
