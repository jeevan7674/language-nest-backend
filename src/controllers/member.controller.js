const memberService = require('../services/member.service');
const exportService = require('../services/export.service');

// Public Member Registration
const registerPublicMember = async (req, res, next) => {
  try {
    const reqInfo = {
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
    };
    const result = await memberService.registerPublicMember(req.body, reqInfo);
    res.status(201).json({
      success: true,
      message: 'Membership registration submitted successfully',
      data: {
        member: result.member,
        whatsappGroupUrl: result.whatsappGroupUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Public Get Payment & WhatsApp Settings
const getPublicPaymentSettings = async (req, res, next) => {
  try {
    const settings = await memberService.getPaymentSettings();
    res.status(200).json({
      success: true,
      message: 'Payment configuration fetched successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Public Live Presence Heartbeat
const postHeartbeat = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const reqInfo = {
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
    };
    await memberService.recordHeartbeat(sessionId, reqInfo);
    res.status(200).json({
      success: true,
      message: 'Heartbeat recorded',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Member Metrics (Total, Today, Live)
const getMemberMetrics = async (req, res, next) => {
  try {
    const metrics = await memberService.getMemberMetrics();
    res.status(200).json({
      success: true,
      message: 'Member metrics fetched successfully',
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Payment Settings
const getAdminPaymentSettings = async (req, res, next) => {
  try {
    const settings = await memberService.getPaymentSettings();
    res.status(200).json({
      success: true,
      message: 'Payment settings fetched successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Payment Settings
const updateAdminPaymentSettings = async (req, res, next) => {
  try {
    const settings = await memberService.updatePaymentSettings(req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const exportMembers = async (req, res, next) => {
  try {
    const format = (req.query.format || 'xlsx').toLowerCase().trim();
    if (format !== 'xlsx' && format !== 'pdf') {
      return res.status(400).json({
        success: false,
        message: 'Invalid export format. Supported formats are "xlsx" and "pdf".',
      });
    }

    const members = await memberService.getMembersForExport(req.query);
    if (!members || members.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No members found for the selected filters.',
      });
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filename = `language-nest-members-${dateStr}.${format}`;

    const adminMeta = {
      generatedBy: req.admin?.name || req.admin?.email || 'Administrator',
    };

    if (format === 'xlsx') {
      const buffer = await exportService.generateMembersExcel(members, req.query, adminMeta);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.status(200).send(buffer);
    } else {
      const buffer = await exportService.generateMembersPdf(members, req.query, adminMeta);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.status(200).send(buffer);
    }
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const result = await memberService.getMembers(req.query);
    res.status(200).json({
      success: true,
      message: 'Members fetched successfully',
      data: result.members,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Member fetched successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    await memberService.deleteMember(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPublicMember,
  getPublicPaymentSettings,
  postHeartbeat,
  getMemberMetrics,
  getAdminPaymentSettings,
  updateAdminPaymentSettings,
  getMembers,
  exportMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
