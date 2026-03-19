const reviewService = require('../services/reviewService');
const Review = require('../models/Review');

class ReviewController {
  async updateReviewAction(req, res) {
    try {
      const { reviewId } = req.params;
      const { status, reviewerId } = req.body;

      // Validation: Check if required parameters are provided
      if (!reviewId || String(reviewId).trim().length === 0) {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      if (!reviewerId) {
        return res.status(400).json({ error: 'reviewerId is required to perform this action' });
      }

      // Call the service to update review status
      const result = await reviewService.updateReviewStatus(reviewId, status, reviewerId);

      // Return updated review and document data
      res.json({
        message: 'Review updated successfully',
        review: result.review,
        document: result.document,
      });
    } catch (error) {
      // Handle specific error types
      if (error.message.includes('already been')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('required') || error.message.includes('invalid')) {
        return res.status(400).json({ error: error.message });
      }

      console.error('Review update error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getReviewsByReviewer(req, res) {
    try {
      const { reviewerId } = req.params;

      if (!reviewerId) {
        return res.status(400).json({ error: 'Reviewer ID is required' });
      }

      const reviews = await Review.find({ reviewer: reviewerId })
        .populate('document')
        .populate('reviewer');

      const documents = reviews.map(review => ({
        _id: review.document._id,
        title: review.document.title,
        status: review.document.status,
        reviewStatus: review.status,
        reviewId: review._id,
      }));

      res.json(documents);
    } catch (error) {
      console.error('Error fetching reviews by reviewer:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReviewController();