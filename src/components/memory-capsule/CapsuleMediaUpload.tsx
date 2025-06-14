
import React, { useState } from "react";

interface Props {
  onChange: (media: {
    imageFile?: File | null;
    audioFile?: File | null;
    videoFile?: File | null;
  }) => void;
}

const CapsuleMediaUpload: React.FC<Props> = ({ onChange }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  function handleFile(type: "image" | "audio" | "video", file: File | null) {
    if (type === "image") setImageFile(file);
    if (type === "audio") setAudioFile(file);
    if (type === "video") setVideoFile(file);
    onChange({
      imageFile: type === "image" ? file : imageFile,
      audioFile: type === "audio" ? file : audioFile,
      videoFile: type === "video" ? file : videoFile,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block font-serif mb-1 text-sm">Image (optional)</label>
        <input type="file" accept="image/*" onChange={e => handleFile("image", e.target.files?.[0] || null)} />
        {imageFile && <div className="text-xs text-gray-500 mt-1">{imageFile.name}</div>}
      </div>
      <div>
        <label className="block font-serif mb-1 text-sm">Audio (optional, ≤ 60s)</label>
        <input type="file" accept="audio/*" onChange={e => handleFile("audio", e.target.files?.[0] || null)} />
        {audioFile && <div className="text-xs text-gray-500 mt-1">{audioFile.name}</div>}
      </div>
      <div>
        <label className="block font-serif mb-1 text-sm">Video (optional, ≤ 60s)</label>
        <input type="file" accept="video/*" onChange={e => handleFile("video", e.target.files?.[0] || null)} />
        {videoFile && <div className="text-xs text-gray-500 mt-1">{videoFile.name}</div>}
      </div>
    </div>
  );
};

export default CapsuleMediaUpload;
