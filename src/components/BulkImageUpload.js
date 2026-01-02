import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import {
  uploadBulkImages,
  deleteS3Image,
  deleteS3Images,
} from "../app/(dashboard)/dashboard/actions";
import { convertImageToBase64 } from "@/lib/utils";
import { compressImage } from "../utils/imageCompression";

// Reusable SVG Icons
const Icons = {
  check: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  ),
  close: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  info: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  image: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  ),
};

const Icon = memo(({ name, className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {Icons[name]}
  </svg>
));

Icon.displayName = "Icon";

// Reusable Image Preview Card Component
const ImagePreviewCard = memo(
  ({ item, index, onApprove, onReject, onUndo, extraInfo }) => (
    <div
      className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 ${
        item.approved
          ? "border-green-400 bg-green-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="aspect-video bg-gray-100 relative">
        <img
          src={item.preview}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {item.approved && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="bg-green-500 rounded-full p-2">
              <Icon name="check" className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-700 truncate mb-1">
          {item.name}
        </p>
        {extraInfo}
        <div className="flex gap-2 mt-2">
          {!item.approved ? (
            <button
              onClick={() => onApprove(index)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors"
              type="button"
            >
              <Icon name="check" />
              Approve
            </button>
          ) : (
            <button
              onClick={() => onUndo(index)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors"
              type="button"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => onReject(index)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
            type="button"
          >
            <Icon name="close" />
            Reject
          </button>
        </div>
      </div>
    </div>
  )
);

ImagePreviewCard.displayName = "ImagePreviewCard";

// Reusable Modal Component
const PreviewModal = memo(
  ({
    isOpen,
    title,
    description,
    iconName,
    iconBgColor,
    iconColor,
    headerGradient,
    previews,
    emptyMessage,
    onCancel,
    onConfirm,
    cancelText,
    confirmText,
    renderCard,
  }) => {
    const approvedCount = useMemo(
      () => previews.filter((item) => item.approved).length,
      [previews]
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
          {/* Modal Header */}
          <div
            className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r ${headerGradient}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 ${iconBgColor} rounded-full`}>
                <Icon name={iconName} className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {previews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previews.map((item, index) => renderCard(item, index))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {approvedCount} of {previews.length} approved
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                type="button"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                type="button"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PreviewModal.displayName = "PreviewModal";

// Custom hook for managing preview state
const usePreviewState = (files, generatePreview) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = files.map(generatePreview);
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [files, generatePreview]);

  const handleApprove = useCallback((index) => {
    setPreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, approved: true } : item))
    );
  }, []);

  const handleReject = useCallback((index) => {
    setPreviews((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleUndo = useCallback((index) => {
    setPreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, approved: false } : item))
    );
  }, []);

  const cleanup = useCallback(() => {
    previews.forEach((p) => {
      if (p?.preview) URL.revokeObjectURL(p.preview);
    });
    setPreviews([]);
  }, [previews]);

  const getApprovedFiles = useCallback(() => {
    return previews.filter((item) => item.approved).map((item) => item.file);
  }, [previews]);

  return {
    previews,
    handleApprove,
    handleReject,
    handleUndo,
    cleanup,
    getApprovedFiles,
  };
};

// Helper function to get filename parts for duplicate check
const getFileNameParts = (fileName) => {
  return fileName.trim().split(".")[0].split("_");
};

// Toast notification component
const Toast = memo(({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 rounded-full flex-shrink-0">
            <Icon name="warning" className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Files Removed</p>
            <p className="text-sm text-amber-700 mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-amber-700 flex-shrink-0"
            type="button"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

Toast.displayName = "Toast";

export default function BulkImageUpload({
  onImagesUpload,
  imageArray,
  projectName,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const fileInputRef = useRef(null);

  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: "" });

  // Modal visibility state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // File states
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [pendingNewFiles, setPendingNewFiles] = useState([]);

  // Preview generators
  const generateDuplicatePreview = useCallback(
    (file) => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      approved: false,
    }),
    []
  );

  // Use custom hooks for preview management
  const duplicatePreviewState = usePreviewState(
    duplicateFiles,
    generateDuplicatePreview
  );

  // Toast close handler
  const closeToast = useCallback(() => {
    setToast({ isVisible: false, message: "" });
  }, []);

  // Memoized existing image names set for duplicate checking
  const existingImageNames = useMemo(
    () =>
      new Set(imageArray.map((img) => img?.name?.split("_").at(-1)?.trim())),
    [imageArray]
  );

  // Reset file input
  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Image removal handlers
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
        resetFileInput();
      } catch (err) {
        console.error("Failed to delete image:", err);
        setError("Failed to delete image. Please try again.");
      }
    },
    [imageArray, onImagesUpload, projectName, resetFileInput]
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
      resetFileInput();
    } catch (err) {
      console.error("Failed to delete all images:", err);
      setError("Failed to delete all images. Please try again.");
    }
  }, [imageArray, onImagesUpload, projectName, resetFileInput]);

  // Process upload function
  const processUpload = useCallback(
    async (filesToUpload) => {
      if (filesToUpload.length === 0) {
        resetFileInput();
        return;
      }

      setUploading(true);
      try {
        const compressedFiles = await Promise.all(
          filesToUpload.map((file) => compressImage(file))
        );

        const formData = new FormData();
        compressedFiles.forEach((file) => formData.append("image", file));

        const response = await uploadBulkImages(formData, projectName);

        const uploadedImages = await Promise.all(
          (response.data?.successful || []).map(async (element) => ({
            url: element?.url,
            name: element?.originalName.split(".")[0].trim(),
            localUrl: await convertImageToBase64(element?.url),
          }))
        );

        if (uploadedImages.length > 0) {
          onImagesUpload([...imageArray, ...uploadedImages]);
          setError(null);
        }
      } catch (err) {
        console.error("Upload failed:", err);
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        resetFileInput();
      }
    },
    [imageArray, onImagesUpload, projectName, resetFileInput]
  );

  // Check for duplicates and proceed
  const proceedWithDuplicateCheck = useCallback(
    (filesToCheck) => {
      const newFiles = [];
      const foundDuplicates = [];

      console.log(existingImageNames);

      filesToCheck.forEach((file) => {
        const fileNameParts = getFileNameParts(file.name);
        const isDuplicate = fileNameParts.some((part) =>
          existingImageNames.has(part)
        );

        if (isDuplicate) {
          foundDuplicates.push(file);
        } else {
          newFiles.push(file);
        }
      });

      if (foundDuplicates.length > 0) {
        setDuplicateFiles(foundDuplicates);
        setPendingNewFiles(newFiles);
        setShowDuplicateModal(true);
        return;
      }

      processUpload(newFiles);
    },
    [existingImageNames, processUpload]
  );

  // Modal handlers
  const handleCancelDuplicates = useCallback(() => {
    duplicatePreviewState.cleanup();
    setShowDuplicateModal(false);
    setDuplicateFiles([]);

    if (pendingNewFiles.length > 0) {
      processUpload(pendingNewFiles);
    } else {
      resetFileInput();
    }
    setPendingNewFiles([]);
  }, [duplicatePreviewState, pendingNewFiles, processUpload, resetFileInput]);

  const handleConfirmDuplicates = useCallback(() => {
    const approvedFiles = duplicatePreviewState.getApprovedFiles();
    duplicatePreviewState.cleanup();
    setShowDuplicateModal(false);
    setDuplicateFiles([]);

    const allFilesToUpload = [...pendingNewFiles, ...approvedFiles];
    setPendingNewFiles([]);

    processUpload(allFilesToUpload);
  }, [duplicatePreviewState, pendingNewFiles, processUpload]);

  // File change handler
  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      if (!projectName?.trim()) {
        alert("Please enter a project name before uploading images.");
        e.target.value = "";
        return;
      }

      const normalizedProjectName = projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
      const matched = [];
      const mismatched = [];

      files.forEach((file) => {
        if (file.name.toLowerCase().includes(normalizedProjectName)) {
          matched.push(file);
        } else {
          mismatched.push(file);
        }
      });

      // If there are mismatched files, show toast and remove them
      if (mismatched.length > 0) {
        const mismatchedNames = mismatched.map((f) => f.name).join(", ");
        const message =
          mismatched.length === 1
            ? `"${mismatchedNames}" was removed (project name mismatch).`
            : `${mismatched.length} files removed (project name mismatch): ${mismatchedNames}`;

        setToast({ isVisible: true, message });

        // If no matched files, just reset and return
        if (matched.length === 0) {
          resetFileInput();
          return;
        }

        // Proceed with only matched files
        proceedWithDuplicateCheck(matched);
        return;
      }

      proceedWithDuplicateCheck(files);
    },
    [projectName, proceedWithDuplicateCheck, resetFileInput]
  );

  // Render card for duplicate modal
  const renderDuplicateCard = useCallback(
    (item, index) => (
      <ImagePreviewCard
        key={index}
        item={item}
        index={index}
        onApprove={duplicatePreviewState.handleApprove}
        onReject={duplicatePreviewState.handleReject}
        onUndo={duplicatePreviewState.handleUndo}
      />
    ),
    [duplicatePreviewState]
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

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
      <PreviewModal
        isOpen={showDuplicateModal}
        title="Duplicate Images Found"
        description="The following images already exist. Approve to replace or reject to skip."
        iconName="warning"
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        headerGradient="from-amber-50 to-orange-50"
        previews={duplicatePreviewState.previews}
        emptyMessage="No duplicate images to review."
        onCancel={handleCancelDuplicates}
        onConfirm={handleConfirmDuplicates}
        cancelText="Cancel"
        confirmText="Confirm & Upload"
        renderCard={renderDuplicateCard}
      />

      {imageArray.length > 0 && (
        <div className="relative">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Icon name="image" className="w-4 h-4 mr-2" />
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
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
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
                    <Icon name="close" />
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
