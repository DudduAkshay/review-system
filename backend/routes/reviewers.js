const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewerController');

router.get('/', reviewerController.getAllReviewers);
router.get('/:reviewerId/documents', reviewerController.getReviewerDocuments);

module.exports = router;