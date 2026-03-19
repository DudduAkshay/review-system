const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.put('/:reviewId', reviewController.updateReviewAction);
router.post('/:reviewId/action', reviewController.updateReviewAction);
router.get('/reviewer/:reviewerId', reviewController.getReviewsByReviewer);

module.exports = router;