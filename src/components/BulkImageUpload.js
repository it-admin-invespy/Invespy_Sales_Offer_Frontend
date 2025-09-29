import { useState } from "react";

export default function BulkImageUpload({ onImagesUpload }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedImages = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        uploadedImages.push({
          url: data.url,
          name: file.name,
        });
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    setImages([...images, ...uploadedImages]);
    onImagesUpload([...images, ...uploadedImages]);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
      
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="text-center">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-32 object-cover rounded border"
              />
              <p className="text-xs text-gray-600 mt-1">{image.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}