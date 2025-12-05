import { useState, useCallback, useRef } from "react";
import {
  uploadBulkImages,
  deleteS3Image,
  deleteS3Images,
} from "../app/(dashboard)/dashboard/actions";
import { convertImageToBase64 } from "@/lib/utils";

export default function BulkImageUpload({
  onImagesUpload,
  imageArray,
  projectName,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleRemoveImage = useCallback(
    async (indexToRemove) => {
      const imageToDelete = imageArray[indexToRemove];

      try {
        if (imageToDelete?.url) {
          await deleteS3Image(imageToDelete.url, projectName);
        }
        onImagesUpload(
          imageArray.filter((_, index) => index !== indexToRemove)
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Failed to delete image:", error);
        setError("Failed to delete image. Please try again.");
      }
    },
    [imageArray, onImagesUpload, projectName]
  );

  const handleDeleteAllImages = useCallback(async () => {
    const imageUrls = imageArray
      .filter((img) => img?.url)
      .map((img) => img.url);

    try {
      if (imageUrls.length > 0) {
        await deleteS3Images(imageUrls, projectName);
      }
      onImagesUpload([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to delete all images:", error);
      setError("Failed to delete all images. Please try again.");
    }
  }, [imageArray, onImagesUpload, projectName]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (!projectName?.trim()) {
      alert("Please enter a project name before uploading images.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const uploadedImages = [];
    const formData = new FormData();

    for (const file of files) {
      formData.append("image", file);
    }

    try {
      const response = await uploadBulkImages(formData, projectName);

      const imagePromises =
        response.data?.successful?.map(async (element) => ({
          url: element?.url,
          name: element?.originalName,
          localUrl: await convertImageToBase64(element?.url),
        })) || [];

      uploadedImages.push(...(await Promise.all(imagePromises)));
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }

    if (uploadedImages.length > 0) {
      const newImages = [...imageArray, ...uploadedImages];
      console.log("New images:", newImages);
      onImagesUpload(newImages);
      setError(null);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {imageArray.length > 0 && (
        <div className="relative">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Uploaded Images ({imageArray.length})
              </h4>
              <button
                onClick={handleDeleteAllImages}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                title="Delete all images"
                type="button"
              >
                Delete All
              </button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {imageArray.map((image, index) => (
                <li
                  key={index}
                  className="group p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex justify-between items-center cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span
                      className="text-sm text-gray-700 font-medium truncate"
                      onMouseEnter={() => setHoveredImage(image)}
                      onMouseLeave={() => setHoveredImage(null)}
                    >
                      {image?.name || `Image ${index + 1}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-all duration-200"
                    title="Remove image"
                    type="button"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {hoveredImage && (
            <div className="absolute top-0 right-0 z-20 p-3 bg-white border border-gray-300 rounded-lg shadow-xl">
              <img
                src={hoveredImage?.url || hoveredImage}
                alt={hoveredImage?.name || "Preview"}
                className="w-56 h-36 object-cover rounded-md"
              />
              <p className="text-xs text-gray-600 mt-2 text-center truncate">
                {hoveredImage?.name || "Preview"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
