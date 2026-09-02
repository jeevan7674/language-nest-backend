const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../services/upload.service');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload',
      });
    }

    const folder = req.body.folder || 'languagenest';
    const oldImageUrl = req.body.oldImageUrl || req.body.oldImage || null;

    const result = await uploadBufferToCloudinary(req.file.buffer, folder, oldImageUrl);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secureUrl || result.url,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
        simulated: result.simulated || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { url, publicId } = req.body;
    const target = publicId || url;

    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL or publicId to delete',
      });
    }

    const result = await deleteFromCloudinary(target);

    return res.status(200).json({
      success: true,
      message: 'Image deleted from Cloudinary',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
