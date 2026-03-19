const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a document title'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
  },
  file: {
    type: String, // filename
  },
  status: {
    type: String,
    enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);