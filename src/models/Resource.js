const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'audio', 'video', 'link', 'other'],
      default: 'pdf',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    language: {
      type: String,
      default: 'General',
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    externalUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.index(
  { title: 'text', description: 'text', category: 'text' },
  { language_override: 'none' }
);

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
