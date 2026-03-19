const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reviewer',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
}, { timestamps: true });

// Compound index to prevent duplicate reviewer assignments to the same document
reviewSchema.index({ document: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);