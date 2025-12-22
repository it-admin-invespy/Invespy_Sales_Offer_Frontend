import imageCompression from "browser-image-compression";

/**
 * Compresses an image file before uploading
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, options = {}) {
  const isDev = process.env.NODE_ENV === "development";
  
  // Validate file exists
  if (!file) {
    throw new Error("No file provided for compression");
  }

  // Default compression options
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type,
    initialQuality: 0.8,
  };

  const compressionOptions = { ...defaultOptions, ...options };
  
  // Calculate file size once (in bytes to MB)
  const originalSizeMB = file.size / (1024 * 1024);
  
  // Early return: Skip compression for already small files
  if (originalSizeMB <= compressionOptions.maxSizeMB) {
    if (isDev) {
      console.log(
        `[Compression Skipped] File already optimal: ${originalSizeMB.toFixed(2)}MB`
      );
    }
    return file;
  }

  // Early return: Skip compression for already-compressed formats
  const alreadyCompressedFormats = ["image/webp", "image/avif"];
  if (alreadyCompressedFormats.includes(file.type)) {
    if (isDev) {
      console.log(
        `[Compression Skipped] File already in compressed format: ${file.type}`
      );
    }
    return file;
  }

  try {
    if (isDev) {
      console.log(`[Compressing] Original: ${originalSizeMB.toFixed(2)}MB`);
    }

    const compressedBlob = await imageCompression(file, compressionOptions);
    
    // Calculate compressed size
    const compressedSizeMB = compressedBlob.size / (1024 * 1024);
    
    // If compression didn't reduce size significantly, return original
    const compressionRatio = (1 - compressedBlob.size / file.size) * 100;
    if (compressionRatio < 5) {
      if (isDev) {
        console.log(
          `[Compression Skipped] Minimal benefit: ${compressionRatio.toFixed(1)}%`
        );
      }
      return file;
    }

    // Convert blob to file
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });

    if (isDev) {
      console.log(
        `[Compressed] ${compressedSizeMB.toFixed(2)}MB | Saved: ${compressionRatio.toFixed(1)}%`
      );
    }

    return compressedFile;
  } catch (error) {
    console.error("[Compression Error]", error.message || error);
    // Fallback to original file on error
    return file;
  }
}
