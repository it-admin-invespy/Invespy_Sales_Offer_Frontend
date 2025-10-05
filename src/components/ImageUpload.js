"use client";

import { useState } from "react";
import { uploadImage } from "../app/(dashboard)/dashboard/actions";

export default function ImageUpload({ onUpload, currentUrl, label }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadImage(formData);
      onUpload(res.data.url);
    } catch (error) {
      console.error("Failed to upload logo", error);
    } finally {
      setUploading(false);
      if (onUpload) {
        onUpload();
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        placeholder={label}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
      {currentUrl && (
        <img
          src={currentUrl}
          alt="Logo"
          className="h-16 w-16 object-cover rounded"
        />
      )}
    </div>
  );
}
