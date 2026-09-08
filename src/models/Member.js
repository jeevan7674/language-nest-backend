const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, 'Phone number is required'],
    },
    department: {
      type: String,
      required: [true, 'Department / Branch is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true,
    },
    joinedDate: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    membershipStatus: {
      type: String,
      enum: ['REGISTERED', 'VERIFIED', 'ACTIVE', 'REJECTED', 'active', 'inactive'],
      default: 'REGISTERED',
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ['QR', 'OFFLINE', 'online', 'offline', 'upi', 'cash'],
      default: 'QR',
    },
    paymentStatus: {
      type: String,
      enum: ['RECORDED', 'PENDING', 'VERIFIED', 'REJECTED', 'paid', 'unpaid'],
      default: 'RECORDED',
      index: true,
    },
    utrNumber: {
      type: String,
      trim: true,
      default: null,
    },
    transactionId: {
      type: String,
      trim: true,
      default: null,
    },
    cashGivenTo: {
      type: String,
      trim: true,
      default: null,
    },
    termsAccepted: {
      type: Boolean,
      default: true,
    },
    termsAcceptedAt: {
      type: Date,
      default: Date.now,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    image: {
      type: String,
      default: null,
    },
    avatar: {
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

memberSchema.index({ memberId: 'text', name: 'text', email: 'text', department: 'text', phone: 'text' });

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
