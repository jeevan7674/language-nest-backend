const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const env = require('../config/env');

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Extract Cloudinary public ID from a URL or raw public ID string.
 * @param {string} url - Full Cloudinary URL or publicId
 * @returns {string|null}
 */
const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  // If already a publicId or local simulated ID
  if (!url.startsWith('http') && !url.startsWith('data:')) {
    return url;
  }

  if (!url.includes('cloudinary.com')) {
    return null;
  }

  // Find index after '/upload/'
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return null;

  const pathAfterUpload = url.substring(uploadIndex + 8);
  const parts = pathAfterUpload.split('/');

  // Skip transformations and version prefixes (e.g. v1709403842)
  let startIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    if (/^v\d+$/.test(parts[i])) {
      startIndex = i + 1;
      break;
    }
  }

  const publicIdWithExt = parts.slice(startIndex).join('/');
  // Remove file extension
  const lastDotIndex = publicIdWithExt.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return publicIdWithExt.substring(0, lastDotIndex);
  }
  return publicIdWithExt;
};

/**
 * Delete an image asset from Cloudinary.
 * @param {string} publicIdOrUrl - Cloudinary publicId or URL
 * @returns {Promise<{ result: string }>}
 */
const deleteFromCloudinary = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return null;
  const publicId = extractPublicIdFromUrl(publicIdOrUrl);
  if (!publicId) return null;

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
    return { result: 'ok', simulated: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.warn(`[Cloudinary] Failed to delete old asset (${publicId}):`, error.message);
    return null;
  }
};

/**
 * Upload a memory buffer directly to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Destination folder in Cloudinary
 * @param {string} [oldImageUrl] - Optional previous image URL to remove
 * @returns {Promise<{ url: string, publicId: string, secureUrl: string }>}
 */
const uploadBufferToCloudinary = async (buffer, folder = 'languagenest', oldImageUrl = null) => {
  // If old image exists, delete it first to free up Cloudinary storage
  if (oldImageUrl) {
    try {
      await deleteFromCloudinary(oldImageUrl);
    } catch (delErr) {
      console.warn('[Cloudinary] Could not delete previous image:', delErr.message);
    }
  }

  return new Promise((resolve, reject) => {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
      // If Cloudinary keys are not configured, provide base64 data URI fallback
      const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      return resolve({
        url: base64,
        secureUrl: base64,
        publicId: `local_${Date.now()}`,
        simulated: true,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

module.exports = {
  extractPublicIdFromUrl,
  deleteFromCloudinary,
  uploadBufferToCloudinary,
};
