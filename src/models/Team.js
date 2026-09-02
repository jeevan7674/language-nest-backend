const mongoose = require('mongoose');

const teamMemberSubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Member role is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const teamSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: [true, 'Academic year is required (e.g., 2024-25)'],
      unique: true,
      trim: true,
    },
    isAlumni: {
      type: Boolean,
      default: false,
    },
    members: [teamMemberSubSchema],
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

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
