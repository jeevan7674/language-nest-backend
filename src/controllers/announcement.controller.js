const announcementService = require('../services/announcement.service');

const getAnnouncements = async (req, res, next) => {
  try {
    const result = await announcementService.getAnnouncements(req.query);
    res.status(200).json({
      success: true,
      message: 'Announcements fetched successfully',
      data: result.announcements,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await announcementService.getAnnouncementById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Announcement fetched successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body, req.admin._id);
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.updateAnnouncement(req.params.id, req.body, req.admin._id);
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

const togglePin = async (req, res, next) => {
  try {
    const announcement = await announcementService.togglePin(req.params.id, req.admin._id);
    res.status(200).json({
      success: true,
      message: announcement.isPinned ? 'Announcement pinned successfully' : 'Announcement unpinned successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  togglePin,
  deleteAnnouncement,
};
