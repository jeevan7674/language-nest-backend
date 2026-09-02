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
