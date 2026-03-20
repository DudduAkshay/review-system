const Reviewer = require('../models/Reviewer');
const Review = require('../models/Review');

class ReviewerController {
  async getAllReviewers(req, res) {
    try {
      const reviewers = await Reviewer.find();
      const reviewersWithStats = await Promise.all(
        reviewers.map(async (reviewer) => {
          // Count assigned documents dynamically
          const totalAssigned = await Review.countDocuments({ reviewer: reviewer._id });
          
          // Count pending reviews dynamically
          const pendingReviews = await Review.countDocuments({ 
            reviewer: reviewer._id, 
            status: 'PENDING' 
          });
          
          // Count approved reviews dynamically
          const approvedReviews = await Review.countDocuments({ 
            reviewer: reviewer._id, 
            status: 'APPROVED' 
          });
          
          // Count rejected reviews dynamically
          const rejectedReviews = await Review.countDocuments({ 
            reviewer: reviewer._id, 
            status: 'REJECTED' 
          });
          
          return {
            _id: reviewer._id,
            name: reviewer.name,
            totalAssigned,
            pendingReviews,
            approvedReviews,
            rejectedReviews,
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