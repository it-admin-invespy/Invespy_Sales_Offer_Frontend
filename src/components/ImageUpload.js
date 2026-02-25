"use client";

import { useState } from "react";
import { uploadImage } from "../app/(dashboard)/dashboard/actions";
import { compressImage } from "../utils/imageCompression";

export default function ImageUpload({ onUpload, label }) {
  const [uploading, setUploading] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setCompressionStatus("Compressing image...");
    
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file);
      
      setCompressionStatus("Uploading...");
      const formData = new FormData();
      formData.append("file", compressedFile);
      
      const { data } = await uploadImage(formData);
      onUpload(data.url);
      setCompressionStatus("");
    } catch (error) {
      console.error("Upload failed:", error);
      setCompressionStatus("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
      />
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {compressionStatus || "Processing..."}
        </div>
      )}
    </div>
  );
}
