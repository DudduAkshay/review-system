const Reviewer = require('../models/Reviewer');
const Review = require('../models/Review');

class ReviewerController {
  async getAllReviewers(req, res) {
    try {
      const reviewers = await Reviewer.find();
      const reviewersWithStats = await Promise.all(
        reviewers.map(async (reviewer) => {
          const totalAssigned = await Review.countDocuments({ reviewer: reviewer._id });
          const pendingReviews = await Review.countDocuments({ reviewer: reviewer._id, status: 'PENDING' });
          return {
            _id: reviewer._id,
            name: reviewer.name,
            totalAssigned,
            pendingReviews,
          };
        })
      );
      res.json(reviewersWithStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getReviewerDocuments(req, res) {
    try {
      const { reviewerId } = req.params;
      const reviews = await Review.find({ reviewer: reviewerId })
        .populate('document')
        .populate('reviewer');
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReviewerController();