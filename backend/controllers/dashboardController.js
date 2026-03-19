const Document = require('../models/Document');
const Reviewer = require('../models/Reviewer');
const Review = require('../models/Review');

class DashboardController {
  async getDashboard(req, res) {
    try {
      const totalDocuments = await Document.countDocuments();
      const statusCountsRaw = await Document.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // Ensure all statuses are present with count 0 if missing
      const allStatuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
      const statusCounts = allStatuses.map(status => {
        const found = statusCountsRaw.find(s => s._id === status);
        return { _id: status, count: found ? found.count : 0 };
      });
      
      const documents = await Document.find();
      const totalReviewers = await Reviewer.countDocuments();
      
      // Get UNIQUE pending reviewers (avoid duplicates)
      const pendingReviews = await Review.find({ status: 'PENDING' }).populate('reviewer');
      const uniquePendingReviewers = new Map();
      const pendingReviewers = [];
      
      pendingReviews.forEach(review => {
        if (review.reviewer && !uniquePendingReviewers.has(review.reviewer._id.toString())) {
          uniquePendingReviewers.set(review.reviewer._id.toString(), true);
          pendingReviewers.push(review.reviewer);
        }
      });
      
      const numberOfPendingReviewers = pendingReviewers.length;

      res.json({
        totalDocuments,
        statusCounts,
        documents,
        totalReviewers,
        numberOfPendingReviewers,
        pendingReviewers,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DashboardController();