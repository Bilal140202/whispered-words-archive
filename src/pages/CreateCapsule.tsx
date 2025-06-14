
import React from "react";
import CapsuleForm from "@/components/memory-capsule/CapsuleForm";

const CreateCapsule = () => (
  <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
    <section className="w-full max-w-xl p-4 md:p-8 rounded-xl shadow-xl bg-white/70 backdrop-blur-md border border-white/50 animate-fade-in">
      <h1 className="font-serif text-2xl md:text-3xl mb-2 text-purple-800 font-semibold text-center">
        Lock a New Memory
      </h1>
      <CapsuleForm />
    </section>
  </main>
);

export default CreateCapsule;
