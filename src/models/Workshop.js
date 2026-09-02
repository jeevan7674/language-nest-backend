const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Workshop title is required'],
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
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: ['French', 'Spanish', 'German', 'Japanese', 'Korean', 'Mandarin', 'Other'],
      default: 'French',
      index: true,
    },
    trainer: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    sessions: {
      type: Number,
      required: [true, 'Number of sessions is required'],
      min: [1, 'Sessions must be at least 1'],
    },
    participants: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Max participants is required'],
      min: [1, 'Max participants must be at least 1'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    poster: {
      type: String,
      default: null,
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

// Index for text search with language_override disabled
workshopSchema.index(
  { title: 'text', description: 'text', trainer: 'text', language: 'text' },
  { language_override: 'none' }
);

const Workshop = mongoose.model('Workshop', workshopSchema);

module.exports = Workshop;
