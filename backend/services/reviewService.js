const Review = require('../models/Review');
const Document = require('../models/Document');
const Reviewer = require('../models/Reviewer');
const ActivityLog = require('../models/ActivityLog');
const documentService = require('./documentService');

class ReviewService {
  async updateReviewStatus(reviewId, status, reviewerId) {
    // Validation: Check reviewId is provided and valid
    if (!reviewId || String(reviewId).trim().length === 0) {
      throw new Error('Review ID is required');
    }

    // Validation: Check status is valid
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Status must be APPROVED or REJECTED');
    }

    // Validation: Check reviewerId is provided
    if (!reviewerId || String(reviewerId).trim().length === 0) {
      throw new Error('reviewerId is required');
    }

    // Get current review
    const review = await Review.findById(reviewId).populate('reviewer document');
    
    if (!review) {
      throw new Error('Review not found');
    }

    // Ensure the caller is the assigned reviewer
    if (String(review.reviewer._id) !== String(reviewerId)) {
      throw new Error('You can only update your own review');
    }

    // Validation: Check if reviewer has already submitted a decision
    if (review.status !== 'PENDING') {
      throw new Error(`Cannot update review. It has already been ${review.status.toLowerCase()}.`);
    }

    // Validation: Ensure document and reviewer exist and are not null
    if (!review.document || !review.document._id) {
      throw new Error('Associated document is invalid');
    }

    if (!review.reviewer || !review.reviewer._id) {
      throw new Error('Associated reviewer is invalid');
    }

    // Update review status
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId, 
      { status }, 
      { new: true }
    ).populate('reviewer document');

    // Add activity log
    const message = `${review.reviewer.name} ${status.toLowerCase()} ${review.document.title}`;
    await ActivityLog.create({ message });

    // Update document status based on all reviews
    const updatedDocument = await documentService.updateDocumentStatus(review.document._id);

    return {
      review: updatedReview,
      document: updatedDocument,
    };
  }
}

module.exports = new ReviewService();