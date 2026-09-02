const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      required: [true, 'Type is required (income or expense)'],
      enum: ['income', 'expense'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    paymentMode: {
      type: String,
      enum: ['online', 'offline', 'cash', 'bank_transfer', 'upi', 'other'],
      default: 'online',
    },
    event: {
      type: String,
      default: null,
      trim: true,
    },
    workshop: {
      type: String,
      default: null,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
      default: null,
    },
    billImage: {
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

financeSchema.index({ title: 'text', category: 'text', reference: 'text' });

const Finance = mongoose.model('Finance', financeSchema);

module.exports = Finance;
