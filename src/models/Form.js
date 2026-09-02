const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'textarea', 'email', 'phone', 'number', 'date', 'select', 'checkbox', 'radio', 'file', 'heading', 'paragraph'],
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
    helpText: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Form title is required'],
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
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
      index: true,
    },
    fields: [formFieldSchema],
    settings: {
      allowMultipleResponses: {
        type: Boolean,
        default: false,
      },
      acceptResponses: {
        type: Boolean,
        default: true,
      },
      responseLimit: {
        type: Number,
        default: null,
      },
      successMessage: {
        type: String,
        default: 'Thank you for your submission!',
      },
    },
    responseCount: {
      type: Number,
      default: 0,
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

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
