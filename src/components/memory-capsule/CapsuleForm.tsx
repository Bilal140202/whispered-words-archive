
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CapsuleMediaUpload from "./CapsuleMediaUpload";
import CapsuleDatePicker from "./CapsuleDatePicker";

type CapsuleFormData = {
  content: string;
  imageFile?: File | null;
  audioFile?: File | null;
  videoFile?: File | null;
  unlock_date: string;
  email_for_delivery?: string;
  allow_public_sharing: boolean;
};

const CapsuleForm: React.FC = () => {
  const [form, setForm] = useState<CapsuleFormData>({
    content: "",
    imageFile: null,
    audioFile: null,
    videoFile: null,
    unlock_date: "",
    email_for_delivery: "",
    allow_public_sharing: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.content.trim()) {
      setError("Please write something for your memory.");
      return;
    }
    if (!form.unlock_date) {
      setError("Unlock date is required.");
      return;
    }

    setSubmitting(true);

    let imageUrl: string | null = null;
    let audioUrl: string | null = null;
    let videoUrl: string | null = null;

    // Upload media if any
    try {
      if (form.imageFile) {
        const { data, error } = await supabase.storage
          .from("memory-capsule-images")
          .upload(`capsule/${Date.now()}_${form.imageFile.name}`, form.imageFile);
        if (error) throw error;
        imageUrl = data?.path
          ? supabase.storage.from("memory-capsule-images").getPublicUrl(data.path).data.publicUrl
          : null;
      }
      if (form.audioFile) {
        const { data, error } = await supabase.storage
          .from("memory-capsule-audio")
          .upload(`capsule/${Date.now()}_${form.audioFile.name}`, form.audioFile);
        if (error) throw error;
        audioUrl = data?.path
          ? supabase.storage.from("memory-capsule-audio").getPublicUrl(data.path).data.publicUrl
          : null;
      }
      if (form.videoFile) {
        const { data, error } = await supabase.storage
          .from("memory-capsule-video")
          .upload(`capsule/${Date.now()}_${form.videoFile.name}`, form.videoFile);
        if (error) throw error;
        videoUrl = data?.path
          ? supabase.storage.from("memory-capsule-video").getPublicUrl(data.path).data.publicUrl
          : null;
      }

      const { data, error: insertError } = await supabase
        .from("memory_capsules")
        .insert([
          {
            content: form.content,
            image_url: imageUrl,
            audio_url: audioUrl,
            video_url: videoUrl,
            unlock_date: form.unlock_date,
            email_for_delivery: form.email_for_delivery || null,
            allow_public_sharing: form.allow_public_sharing,
          },
        ])
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSubmitSuccess(true);
      window.location.href = `/memory-capsule/unlock/${data.id}`;
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleMedia(files: {
    imageFile?: File | null;
    audioFile?: File | null;
    videoFile?: File | null;
  }) {
    setForm((f) => ({ ...f, ...files }));
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
      <Textarea
        required
        value={form.content}
        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        placeholder="Write your memory here..."
        className="font-serif min-h-[120px] bg-white/70"
      />
      <CapsuleMediaUpload onChange={handleMedia} />
      <CapsuleDatePicker
        value={form.unlock_date}
        onChange={date => setForm(f => ({ ...f, unlock_date: date }))}
      />
      <Input
        type="email"
        value={form.email_for_delivery}
        placeholder="Email for delivery (optional)"
        onChange={e => setForm(f => ({ ...f, email_for_delivery: e.target.value }))}
        className="font-serif"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.allow_public_sharing}
          onChange={e => setForm(f => ({ ...f, allow_public_sharing: e.target.checked }))}
          className="accent-pink-400"
        />
        Allow capsule to be shared in public feed after unlock
      </label>
      {error && (
        <div className="text-red-500 text-sm font-medium">{error}</div>
      )}
      <Button
        type="submit"
        className="w-full bg-pink-400 hover:bg-pink-500 py-3 font-serif text-lg"
        disabled={submitting}
      >
        {submitting ? "Locking..." : "Lock Memory Capsule"}
      </Button>
    </form>
  );
};

export default CapsuleForm;
