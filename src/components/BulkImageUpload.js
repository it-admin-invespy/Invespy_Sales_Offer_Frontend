import { useState, useCallback, useRef, useEffect } from "react";
import {
  uploadBulkImages,
  deleteS3Image,
  deleteS3Images,
} from "../app/(dashboard)/dashboard/actions";
import { convertImageToBase64 } from "@/lib/utils";
import { compressImage } from "../utils/imageCompression";

export default function BulkImageUpload({
  onImagesUpload,
  imageArray,
  projectName,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const fileInputRef = useRef(null);

  // State for duplicate preview modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [pendingNewFiles, setPendingNewFiles] = useState([]);
  const [duplicatePreviews, setDuplicatePreviews] = useState([]);

  // Generate previews for duplicate files
  useEffect(() => {
    if (duplicateFiles.length > 0) {
      const previews = duplicateFiles.map((file) => ({
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
        approved: false,
      }));
      setDuplicatePreviews(previews);

      // Cleanup object URLs on unmount
      return () => {
        previews.forEach((p) => URL.revokeObjectURL(p.preview));
      };
    }
  }, [duplicateFiles]);

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

  // Handle approving a duplicate image
  const handleApproveDuplicate = (index) => {
    setDuplicatePreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, approved: true } : item))
    );
  };

  // Handle rejecting/deleting a duplicate image
  const handleRejectDuplicate = (index) => {
    setDuplicatePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Close modal and cancel all duplicates
  const handleCancelDuplicates = () => {
    duplicatePreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    setShowDuplicateModal(false);
    setDuplicateFiles([]);
    setDuplicatePreviews([]);
    // Continue with only new files if any
    if (pendingNewFiles.length > 0) {
      processUpload(pendingNewFiles);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Confirm approved duplicates and proceed with upload
  const handleConfirmDuplicates = () => {
    const approvedFiles = duplicatePreviews
      .filter((item) => item.approved)
      .map((item) => item.file);

    // Cleanup previews
    duplicatePreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    setShowDuplicateModal(false);
    setDuplicateFiles([]);
    setDuplicatePreviews([]);

    // Combine approved duplicates with new files
    const allFilesToUpload = [...pendingNewFiles, ...approvedFiles];

    if (allFilesToUpload.length > 0) {
      processUpload(allFilesToUpload);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Process upload function
  const processUpload = async (filesToUpload) => {
    setUploading(true);
    const compressedFiles = await Promise.all(
      filesToUpload.map(async (file) => compressImage(file))
    );
    const uploadedImages = [];
    const formData = new FormData();

    for (const file of compressedFiles) {
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (!projectName?.trim()) {
      alert("Please enter a project name before uploading images.");
      e.target.value = "";
      return;
    }

    // Check for duplicate images by comparing file names with existing imageArray
    const existingImageNames = new Set(
      imageArray.map((img) => img?.name?.split("-")[0].trim())
    );

    existingImageNames.forEach((name) => console.log("Existing name:", name));

    const newFiles = files.filter((file) => {
      const fileNameParts = file.name.trim().split(".")[0].split("_");
      // Check if any part of the filename matches existing names
      return !fileNameParts.some((part) => existingImageNames.has(part));
    });

    console.log("New files:", newFiles);

    const foundDuplicates = files.filter((file) => {
      const fileNameParts = file.name.trim().split(".")[0].split("_");
      // Check if any part of the filename matches existing names
      return fileNameParts.some((part) => existingImageNames.has(part));
    });

    console.log("Found duplicates:", foundDuplicates);

    // If duplicates found, show modal for approval
    if (foundDuplicates.length > 0) {
      setDuplicateFiles(foundDuplicates);
      setPendingNewFiles(newFiles);
      setShowDuplicateModal(true);
      return;
    }

    // If no duplicates, proceed with upload
    if (newFiles.length === 0) {
      e.target.value = "";
      return;
    }

    await processUpload(newFiles);
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

      {/* Duplicate Preview Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Duplicate Images Found
                  </h3>
                  <p className="text-sm text-gray-600">
                    The following images already exist. Approve to replace or
                    reject to skip.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {duplicatePreviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No duplicate images to review.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {duplicatePreviews.map((item, index) => (
                    <div
                      key={index}
                      className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                        item.approved
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="aspect-video bg-gray-100 relative">
                        <img
                          src={item.preview}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {item.approved && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="bg-green-500 rounded-full p-2">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Info & Actions */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-700 truncate mb-3">
                          {item.name}
                        </p>
                        <div className="flex gap-2">
                          {!item.approved ? (
                            <button
                              onClick={() => handleApproveDuplicate(index)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setDuplicatePreviews((prev) =>
                                  prev.map((p, i) =>
                                    i === index ? { ...p, approved: false } : p
                                  )
                                )
                              }
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors"
                              type="button"
                            >
                              Undo
                            </button>
                          )}
                          <button
                            onClick={() => handleRejectDuplicate(index)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
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
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {duplicatePreviews.filter((item) => item.approved).length} of{" "}
                {duplicatePreviews.length} approved
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDuplicates}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                  type="button"
                >
                  Skip All Duplicates
                </button>
                <button
                  onClick={handleConfirmDuplicates}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  type="button"
                >
                  Confirm & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto">
              {imageArray.map((image, index) => (
                <div
                  key={index}
                  className="group p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex justify-between items-center cursor-pointer flex-shrink-0"
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
                </div>
              ))}
            </div>
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
