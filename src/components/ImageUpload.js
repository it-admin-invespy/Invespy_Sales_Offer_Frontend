import { useState } from "react";

export default function ImageUpload({ onUpload, currentUrl }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
      {currentUrl && (
        <img src={currentUrl} alt="Logo" className="h-16 w-16 object-cover rounded" />
      )}
    </div>
  );
}