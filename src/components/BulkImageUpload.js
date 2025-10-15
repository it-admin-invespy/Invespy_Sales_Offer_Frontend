import { useEffect, useState } from "react";
import { uploadBulkImages } from "../app/(dashboard)/dashboard/actions";
import { convertImageToBase64 } from "@/app/lib/utils";

export default function BulkImageUpload({ onImagesUpload, imageArray }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (imageArray.length === 0) return;
    setImages(imageArray);
  }, [imageArray]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedImages = [];
    const formData = new FormData();

    for (const file of files) {
      formData.append("image", file);
    }

    try {
      const response = await uploadBulkImages(formData);
      console.log("Upload successful:", response.data.successful);

      for (let i = 0; i < (response.data?.successful?.length || 0); i++) {
        const element = response.data.successful[i];
        const localUrl = await convertImageToBase64(element?.url);
        uploadedImages.push({
          url: element?.url,
          name: element?.originalName,
          localUrl: localUrl,
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }

    if (uploadedImages.length > 0) {
      console.log("Uploaded images:", uploadedImages);
      setImages((prev) => {
        return [...prev, ...uploadedImages];
      });
      onImagesUpload((prev) => {
        return [...prev, ...uploadedImages];
      });
      setError(null);
    }
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
      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={image?.url || index} className="text-center">
              <img
                src={image?.url || image}
                alt={image?.name || "Image"}
                className="w-full h-32 object-cover rounded border"
              />
              <p className="text-xs text-gray-600 mt-1">{image?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
