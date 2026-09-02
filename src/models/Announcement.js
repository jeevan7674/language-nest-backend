const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Event Update', 'Workshop Reminder', 'General'],
      default: 'General',
      index: true,
    },
    target: {
      type: String,
      enum: ['All Members', 'Specific Groups', 'Admins Only'],
      default: 'All Members',
    },
    author: {
      type: String,
      default: 'Admin Team',
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    image: {
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

announcementSchema.index({ title: 'text', message: 'text', author: 'text' });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
