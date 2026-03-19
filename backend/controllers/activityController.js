const ActivityLog = require('../models/ActivityLog');

class ActivityController {
  async getActivities(req, res) {
    try {
      const activities = await ActivityLog.find().sort({ timestamp: -1 }).limit(20);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ActivityController();