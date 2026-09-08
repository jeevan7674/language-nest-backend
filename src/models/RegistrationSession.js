const mongoose = require('mongoose');

const registrationSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      expires: 90, // MongoDB TTL index: automatically deletes document 90 seconds after lastActiveAt
    },
  },
  {
    timestamps: true,
  }
);

const RegistrationSession = mongoose.model('RegistrationSession', registrationSessionSchema);

module.exports = RegistrationSession;
