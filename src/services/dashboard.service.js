const Member = require('../models/Member');
const Event = require('../models/Event');
const Workshop = require('../models/Workshop');
const Announcement = require('../models/Announcement');
const Admin = require('../models/Admin');
const Finance = require('../models/Finance');

const getDashboardStats = async () => {
  const [
    totalMembers,
    activeMembers,
    totalEvents,
    upcomingEvents,
    totalWorkshops,
    ongoingWorkshops,
    totalAnnouncements,
    pinnedAnnouncements,
    activeAdmins,
    upcomingEventsList,
    financeTotals,
  ] = await Promise.all([
    Member.countDocuments(),
    Member.countDocuments({ status: 'active' }),
    Event.countDocuments(),
    Event.countDocuments({ status: 'upcoming' }),
    Workshop.countDocuments(),
    Workshop.countDocuments({ status: 'ongoing' }),
    Announcement.countDocuments(),
    Announcement.countDocuments({ isPinned: true }),
    Admin.countDocuments({ status: 'active' }),
    Event.find({ status: 'upcoming' }).sort({ date: 1 }).limit(5),
    Finance.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  financeTotals.forEach((item) => {
    if (item._id === 'income') totalIncome = item.total;
    if (item._id === 'expense') totalExpense = item.total;
  });

  // Calculate event categories distribution
  const eventCategoryStats = await Event.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryDistribution = eventCategoryStats.map((item) => ({
    name: item._id,
    count: item.count,
  }));

  return {
    metrics: {
      members: {
        total: totalMembers,
        active: activeMembers,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
      },
      workshops: {
        total: totalWorkshops,
        ongoing: ongoingWorkshops,
      },
      announcements: {
        total: totalAnnouncements,
        pinned: pinnedAnnouncements,
      },
      admins: {
        active: activeAdmins,
      },
      finance: {
        income: totalIncome,
        expenses: totalExpense,
        balance: totalIncome - totalExpense,
      },
    },
    upcomingEvents: upcomingEventsList,
    categoryDistribution,
  };
};

module.exports = {
  getDashboardStats,
};
