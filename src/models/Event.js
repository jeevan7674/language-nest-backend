const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
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
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Conversation', 'Cultural', 'Workshop', 'Other'],
      default: 'Conversation',
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    registered: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'scheduled'],
      default: 'upcoming',
      index: true,
    },
    poster: {
      type: String,
      default: null,
    },
    registrationForm: {
      type: String,
      default: null,
    },
    prize: {
      type: String,
      trim: true,
      default: null,
    },
    accessFee: {
      type: String,
      trim: true,
      default: 'Free for members',
    },
    organizer: {
      type: String,
      trim: true,
      default: 'Language Nest Club',
    },
    schedule: [
      {
        time: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true, default: '' },
      },
    ],
    agenda: [
      {
        time: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true, default: '' },
      },
    ],
    guidelines: [{ type: String, trim: true }],
    rules: [{ type: String, trim: true }],
    winner: {
      type: String,
      trim: true,
      default: null,
    },
    winners: {
      first: { type: String, trim: true, default: null },
      second: { type: String, trim: true, default: null },
      third: { type: String, trim: true, default: null },
    },
    featured: {
      type: Boolean,
      default: false,
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

// Index for search
eventSchema.index({ title: 'text', description: 'text', venue: 'text' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
