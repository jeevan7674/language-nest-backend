const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./admin/dashboard.routes');
const adminRoutes = require('./admin/admin.routes');
const eventRoutes = require('./admin/event.routes');
const workshopRoutes = require('./admin/workshop.routes');
const memberRoutes = require('./admin/member.routes');
const teamRoutes = require('./admin/team.routes');
const announcementRoutes = require('./admin/announcement.routes');
const financeRoutes = require('./admin/finance.routes');
const formRoutes = require('./admin/form.routes');
const resourceRoutes = require('./admin/resource.routes');
const galleryRoutes = require('./admin/gallery.routes');
const newsRoutes = require('./admin/news.routes');
const storyRoutes = require('./admin/story.routes');
const uploadRoutes = require('./upload.routes');

// Public health check
router.use('/health', healthRoutes);

// Auth routes (/api/v1/auth/*)
router.use('/auth', authRoutes);

// Image / File Upload routes (/api/v1/upload/*)
router.use('/upload', uploadRoutes);
router.use('/admin/upload', uploadRoutes);

// Admin management routes (/api/v1/admin/*)
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/admins', adminRoutes);
router.use('/admin/events', eventRoutes);
router.use('/admin/workshops', workshopRoutes);
router.use('/admin/members', memberRoutes);
router.use('/admin/team', teamRoutes);
router.use('/admin/announcements', announcementRoutes);
router.use('/admin/finance', financeRoutes);
router.use('/admin/forms', formRoutes);
router.use('/admin/resources', resourceRoutes);
router.use('/admin/gallery', galleryRoutes);
router.use('/admin/news', newsRoutes);
router.use('/admin/stories', storyRoutes);

module.exports = router;
