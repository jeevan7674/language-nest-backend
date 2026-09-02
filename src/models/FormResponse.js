const mongoose = require('mongoose');

const formResponseSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: [true, 'Form ID is required'],
      index: true,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Answers data is required'],
    },
    respondentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    respondentName: {
      type: String,
      trim: true,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const FormResponse = mongoose.model('FormResponse', formResponseSchema);

module.exports = FormResponse;
