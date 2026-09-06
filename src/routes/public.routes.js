const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event.controller');
const teamController = require('../controllers/team.controller');
const facultyController = require('../controllers/faculty.controller');
const workshopController = require('../controllers/workshop.controller');
const announcementController = require('../controllers/announcement.controller');
const formController = require('../controllers/form.controller');
const contentController = require('../controllers/content.controller');

// Public Events
router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEventById);
router.post('/events/:id/register', eventController.registerForEvent);

// Public Teams & Global Faculty
router.get('/team', teamController.getTeams);
router.get('/team/:id', teamController.getTeamById);
router.get('/faculty', facultyController.getFaculty);
router.get('/faculty/:id', facultyController.getFacultyById);

// Public Workshops
router.get('/workshops', workshopController.getWorkshops);
router.get('/workshops/:id', workshopController.getWorkshopById);

// Public Announcements
router.get('/announcements', announcementController.getAnnouncements);

// Public Custom Forms
router.get('/forms/:id', formController.getFormById);
router.post('/forms/:id/submit', formController.submitFormResponse);

// Public Content (Gallery, News, Stories, Resources)
router.get('/gallery', contentController.getGalleries);
router.get('/gallery/:id', contentController.getGalleryById);
router.get('/news', contentController.getNews);
router.get('/news/:id', contentController.getNewsById);
router.get('/stories', contentController.getStories);
router.get('/stories/:id', contentController.getStoryById);
router.get('/resources', contentController.getResources);
router.get('/resources/:id', contentController.getResourceById);

module.exports = router;
