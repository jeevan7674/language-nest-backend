const Member = require('../models/Member');
const Setting = require('../models/Setting');
const RegistrationSession = require('../models/RegistrationSession');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { deleteFromCloudinary } = require('./upload.service');
const { syncMemberToGoogleSheets } = require('./googleSheets.service');
const { sendMemberWelcomeEmail } = require('./email.service');

const DEFAULT_PAYMENT_SETTINGS = {
  upiId: 'gayaz508@ibl',
  upiPayeeName: 'Gayaz Language Nest',
  whatsappGroupUrl: 'https://chat.whatsapp.com/LanguageNest',
  allowOfflinePayment: true,
};

/**
 * Generate a sequential, unique Member ID in the format: LN26001
 * LN = Language Nest club prefix
 * 26 = 2-digit registration year (e.g. 2026 -> 26)
 * 001 = 3-digit sequential number starting from 001 to 999
 */
const generateNextMemberId = async () => {
  const currentYear2Digits = new Date().getFullYear().toString().slice(-2); // "26"
  const prefix = `LN${currentYear2Digits}`; // "LN26"
  const regex = new RegExp(`^${prefix}(\\d{3})$`);

  // Find existing members with this year's prefix
  const members = await Member.find(
    { memberId: { $regex: regex } },
    { memberId: 1 }
  ).sort({ memberId: -1 });

  let maxNum = 0;
  for (const m of members) {
    const match = m.memberId?.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  // If no LN26XXX IDs yet, check count for this year as baseline
  if (maxNum === 0) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const countThisYear = await Member.countDocuments({
      createdAt: { $gte: startOfYear },
    });
    maxNum = countThisYear;
  }

  let nextNum = maxNum + 1;
  if (nextNum > 999) {
    nextNum = nextNum; // Support beyond 999 if count exceeds
  }
  const padded = String(nextNum).padStart(3, '0');
  const candidateId = `${prefix}${padded}`;

  // Collision safety check
  const exists = await Member.findOne({ memberId: candidateId });
  if (exists) {
    for (let i = nextNum + 1; i <= 9999; i++) {
      const altId = `${prefix}${String(i).padStart(3, '0')}`;
      const altExists = await Member.findOne({ memberId: altId });
      if (!altExists) return altId;
    }
  }

  return candidateId;
};

/**
 * Get configured payment and WhatsApp settings
 */
const getPaymentSettings = async () => {
  const setting = await Setting.findOne({ key: 'payment_settings' });
  if (!setting || !setting.value) {
    return DEFAULT_PAYMENT_SETTINGS;
  }
  return {
    upiId: setting.value.upiId || DEFAULT_PAYMENT_SETTINGS.upiId,
    upiPayeeName: setting.value.upiPayeeName || DEFAULT_PAYMENT_SETTINGS.upiPayeeName,
    whatsappGroupUrl: setting.value.whatsappGroupUrl || DEFAULT_PAYMENT_SETTINGS.whatsappGroupUrl,
    allowOfflinePayment: setting.value.allowOfflinePayment !== undefined ? Boolean(setting.value.allowOfflinePayment) : true,
  };
};

/**
 * Update payment and WhatsApp settings
 */
const updatePaymentSettings = async (data, adminId) => {
  const current = await getPaymentSettings();
  const updatedValue = {
    upiId: data.upiId !== undefined ? String(data.upiId).trim() : current.upiId,
    upiPayeeName: data.upiPayeeName !== undefined ? String(data.upiPayeeName).trim() : current.upiPayeeName,
    whatsappGroupUrl: data.whatsappGroupUrl !== undefined ? String(data.whatsappGroupUrl).trim() : current.whatsappGroupUrl,
    allowOfflinePayment: data.allowOfflinePayment !== undefined ? Boolean(data.allowOfflinePayment) : current.allowOfflinePayment,
  };

  const setting = await Setting.findOneAndUpdate(
    { key: 'payment_settings' },
    {
      $set: {
        key: 'payment_settings',
        value: updatedValue,
        description: 'Payment QR details, WhatsApp group invite link, and offline registration settings',
        updatedBy: adminId || null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return setting.value;
};

/**
 * Record a heartbeat for live candidate registration
 */
const recordHeartbeat = async (sessionId, reqInfo = {}) => {
  if (!sessionId) return null;
  return RegistrationSession.findOneAndUpdate(
    { sessionId },
    {
      sessionId,
      ip: reqInfo.ip || '',
      userAgent: reqInfo.userAgent || '',
      lastActiveAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

/**
 * Remove a candidate session on registration completion or exit
 */
const removeHeartbeat = async (sessionId) => {
  if (!sessionId) return;
  await RegistrationSession.deleteOne({ sessionId });
};

/**
 * Public membership registration handler
 */
const registerPublicMember = async (data, reqInfo = {}) => {
  const name = (data.fullName || data.name || '').trim();
  const email = (data.email || '').toLowerCase().trim();
  const phone = (data.phone || '').trim();
  const department = (data.branch || data.department || '').trim();
  const year = (data.year || '').trim();
  const paymentMode = (data.paymentMode || 'QR').toUpperCase();
  const termsAccepted = data.termsAccepted === true || data.agreeToTerms === true || data.terms === true;

  if (!name) {
    const error = new Error('Full Name is required');
    error.statusCode = 400;
    throw error;
  }
  if (!email) {
    const error = new Error('Valid email address is required');
    error.statusCode = 400;
    throw error;
  }
  if (!phone) {
    const error = new Error('Phone number is required');
    error.statusCode = 400;
    throw error;
  }
  if (!department) {
    const error = new Error('Branch / Department is required');
    error.statusCode = 400;
    throw error;
  }
  if (!year) {
    const error = new Error('Academic Year is required');
    error.statusCode = 400;
    throw error;
  }
  if (!termsAccepted) {
    const error = new Error('You must accept the Terms & Conditions to register');
    error.statusCode = 400;
    throw error;
  }

  // Payment method validation
  let utrNumber = null;
  let cashGivenTo = null;

  if (paymentMode === 'QR' || paymentMode === 'ONLINE' || paymentMode === 'UPI') {
    utrNumber = (data.utrNumber || data.transactionId || '').trim();
    if (!utrNumber) {
      const error = new Error('Transaction ID / UTR Number is required for QR payment');
      error.statusCode = 400;
      throw error;
    }
  } else if (paymentMode === 'OFFLINE' || paymentMode === 'CASH') {
    const currentSettings = await getPaymentSettings();
    if (currentSettings.allowOfflinePayment === false) {
      const error = new Error('Offline cash registrations are currently disabled. Please pay using the QR code / UPI.');
      error.statusCode = 400;
      throw error;
    }
    cashGivenTo = (data.cashGivenTo || '').trim();
    if (!cashGivenTo) {
      const error = new Error('Please specify the person to whom cash was given');
      error.statusCode = 400;
      throw error;
    }
  } else {
    const error = new Error('Invalid payment mode selected');
    error.statusCode = 400;
    throw error;
  }

  // Duplicate Check by email or phone
  const existingMember = await Member.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingMember) {
    if (existingMember.email === email) {
      const error = new Error('A member with this email address has already registered');
      error.statusCode = 409;
      throw error;
    }
    if (existingMember.phone === phone) {
      const error = new Error('A member with this phone number has already registered');
      error.statusCode = 409;
      throw error;
    }
  }

  // Generate Member ID
  const memberId = await generateNextMemberId();
  const normalizedPaymentMode = (paymentMode === 'QR' || paymentMode === 'ONLINE' || paymentMode === 'UPI') ? 'QR' : 'OFFLINE';

  const member = new Member({
    memberId,
    name,
    email,
    phone,
    department,
    year,
    paymentMode: normalizedPaymentMode,
    utrNumber: utrNumber || null,
    transactionId: utrNumber || null,
    cashGivenTo: cashGivenTo || null,
    termsAccepted: true,
    termsAcceptedAt: new Date(),
    membershipStatus: 'REGISTERED',
    paymentStatus: 'RECORDED',
    status: 'active',
    registeredAt: new Date(),
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  });

  await member.save();

  // Clear live presence session if provided
  if (data.sessionId) {
    removeHeartbeat(data.sessionId).catch(() => {});
  }

  // Get WhatsApp group URL
  const settings = await getPaymentSettings();
  const whatsappGroupUrl = settings.whatsappGroupUrl;

  // Background non-blocking syncs
  syncMemberToGoogleSheets(member).catch((err) => {
    console.error('❌ [Google Sheets Background Error]:', err.message);
  });

  sendMemberWelcomeEmail(member, whatsappGroupUrl).catch((err) => {
    console.error('❌ [Email Background Error]:', err.message);
  });

  return {
    member,
    whatsappGroupUrl,
  };
};

/**
 * Get registration metrics for Admin dashboard
 */
const getMemberMetrics = async () => {
  // Total registrations
  const totalRegistrations = await Member.countDocuments();

  // Today's registrations in IST (UTC+5:30)
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  const startOfTodayUtc = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()) - istOffsetMs);
  const endOfTodayUtc = new Date(startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000);

  const todayRegistrations = await Member.countDocuments({
    createdAt: { $gte: startOfTodayUtc, $lt: endOfTodayUtc },
  });

  // Live Registering Candidates (active presence sessions)
  const liveRegistering = await RegistrationSession.countDocuments();

  return {
    totalRegistrations,
    todayRegistrations,
    liveRegistering,
  };
};

/**
/**
 * Build unified MongoDB filter for Members (shared between table view and exports)
 */
const buildMemberFilter = (query = {}) => {
  const filter = {};

  if (query.search && String(query.search).trim()) {
    const searchRegex = new RegExp(String(query.search).trim(), 'i');
    filter.$or = [
      { memberId: searchRegex },
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { department: searchRegex },
      { transactionId: searchRegex },
      { utrNumber: searchRegex },
      { cashGivenTo: searchRegex },
    ];
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.membershipStatus && query.membershipStatus !== 'all') {
    filter.membershipStatus = query.membershipStatus;
  }

  if (query.department && query.department !== 'all') {
    filter.department = query.department;
  }

  if (query.paymentMode && query.paymentMode !== 'all') {
    filter.paymentMode = query.paymentMode;
  }

  return filter;
};

/**
 * Get paginated members list for Admin
 */
const getMembers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildMemberFilter(query);

  const [members, total] = await Promise.all([
    Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Member.countDocuments(filter),
  ]);

  return {
    members,
    pagination: getPaginationMeta(total, page, limit),
  };
};

/**
 * Get all filtered members for Export (Excel / PDF) without pagination limit
 */
const getMembersForExport = async (query = {}) => {
  const filter = buildMemberFilter(query);
  const members = await Member.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .lean();
  return members;
};

const getMemberById = async (id) => {
  const member = await Member.findById(id).populate('createdBy', 'name email').populate('updatedBy', 'name email');
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }
  return member;
};

const createMember = async (data, creatorId) => {
  const email = (data.email || '').toLowerCase().trim();
  const existing = await Member.findOne({ email });
  if (existing) {
    const error = new Error('Member with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const memberId = data.memberId || (await generateNextMemberId());
  const paymentMode = (data.paymentMode || 'online').toUpperCase();
  const normalizedPaymentMode = paymentMode === 'ONLINE' || paymentMode === 'QR' || paymentMode === 'UPI' ? 'QR' : 'OFFLINE';

  const member = new Member({
    ...data,
    memberId,
    email,
    paymentMode: normalizedPaymentMode,
    utrNumber: data.utrNumber || data.transactionId || null,
    transactionId: data.utrNumber || data.transactionId || null,
    cashGivenTo: data.cashGivenTo || null,
    termsAccepted: true,
    termsAcceptedAt: new Date(),
    membershipStatus: data.membershipStatus || 'REGISTERED',
    paymentStatus: data.paymentStatus || 'RECORDED',
    status: data.status || 'active',
    joinedDate: data.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    registeredAt: data.registeredAt || new Date(),
    createdBy: creatorId,
  });

  await member.save();

  // Async sync
  syncMemberToGoogleSheets(member).catch(() => {});

  return member;
};

const updateMember = async (id, data, updaterId) => {
  const member = await Member.findById(id);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  const newAvatar = data.image !== undefined ? data.image : data.avatar;
  const currentAvatar = member.image || member.avatar;
  if (newAvatar !== undefined && currentAvatar && currentAvatar !== newAvatar) {
    deleteFromCloudinary(currentAvatar).catch(() => {});
  }

  if (data.email && data.email.toLowerCase().trim() !== member.email) {
    const existing = await Member.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (existing) {
      const error = new Error('Member with this email already exists');
      error.statusCode = 409;
      throw error;
    }
    member.email = data.email.toLowerCase().trim();
  }

  if (data.name) member.name = data.name.trim();
  if (data.phone !== undefined) member.phone = data.phone;
  if (data.department) member.department = data.department;
  if (data.year) member.year = data.year;
  if (data.status) member.status = data.status;
  if (data.membershipStatus) member.membershipStatus = data.membershipStatus;
  if (data.paymentStatus) member.paymentStatus = data.paymentStatus;
  if (data.paymentMode) {
    const pm = data.paymentMode.toUpperCase();
    member.paymentMode = pm === 'ONLINE' || pm === 'QR' || pm === 'UPI' ? 'QR' : 'OFFLINE';
  }
  if (data.utrNumber !== undefined) member.utrNumber = data.utrNumber;
  if (data.transactionId !== undefined) {
    member.transactionId = data.transactionId;
    if (!member.utrNumber) member.utrNumber = data.transactionId;
  }
  if (data.cashGivenTo !== undefined) member.cashGivenTo = data.cashGivenTo;
  if (data.image !== undefined) member.image = data.image;
  if (data.avatar !== undefined) member.avatar = data.avatar;

  member.updatedBy = updaterId;
  await member.save();
  return member;
};

const deleteMember = async (id) => {
  const member = await Member.findByIdAndDelete(id);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    throw error;
  }

  const avatarToDelete = member.image || member.avatar;
  if (avatarToDelete) {
    deleteFromCloudinary(avatarToDelete).catch(() => {});
  }

  return member;
};

module.exports = {
  getMembers,
  getMembersForExport,
  buildMemberFilter,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getPaymentSettings,
  updatePaymentSettings,
  recordHeartbeat,
  removeHeartbeat,
  registerPublicMember,
  getMemberMetrics,
};
