const mongoose = require('mongoose');
const Document = require('./models/Document');
const Reviewer = require('./models/Reviewer');
const Review = require('./models/Review');
const documentService = require('./services/documentService');

const seedDatabase = async () => {
  try {
    // Check if already seeded
    const docCount = await Document.countDocuments();
    if (docCount > 0) {
      console.log('Database already seeded');
      return;
    }
    
    // Clear existing data
    await Document.deleteMany({});
    await Reviewer.deleteMany({});
    await Review.deleteMany({});

    // Create reviewers
    const reviewers = await Reviewer.insertMany([
      { name: 'Alice Johnson' },
      { name: 'Bob Smith' },
      { name: 'Charlie Brown' },
      { name: 'Diana Prince' },
      { name: 'Eve Wilson' }
    ]);

    // Create documents
    const documents = await Document.insertMany([
      { title: 'Project Proposal Q1', status: 'DRAFT' },
      { title: 'Budget Report 2024', status: 'DRAFT' },
      { title: 'Marketing Strategy', status: 'DRAFT' },
      { title: 'Technical Documentation', status: 'DRAFT' },
      { title: 'User Manual v2.0', status: 'DRAFT' }
    ]);

    // Create reviews
    const reviews = [
      // Document 1: Project Proposal Q1 (DRAFT) - all pending
      { document: documents[0]._id, reviewer: reviewers[0]._id, status: 'PENDING' },
      { document: documents[0]._id, reviewer: reviewers[1]._id, status: 'PENDING' },
      { document: documents[0]._id, reviewer: reviewers[2]._id, status: 'PENDING' },

      // Document 2: Budget Report 2024 (IN_REVIEW) - mixed statuses
      { document: documents[1]._id, reviewer: reviewers[0]._id, status: 'APPROVED' },
      { document: documents[1]._id, reviewer: reviewers[1]._id, status: 'PENDING' },
      { document: documents[1]._id, reviewer: reviewers[3]._id, status: 'APPROVED' },

      // Document 3: Marketing Strategy (APPROVED) - all approved
      { document: documents[2]._id, reviewer: reviewers[1]._id, status: 'APPROVED' },
      { document: documents[2]._id, reviewer: reviewers[2]._id, status: 'APPROVED' },
      { document: documents[2]._id, reviewer: reviewers[4]._id, status: 'APPROVED' },

      // Document 4: Technical Documentation (REJECTED) - one rejected
      { document: documents[3]._id, reviewer: reviewers[0]._id, status: 'APPROVED' },
      { document: documents[3]._id, reviewer: reviewers[2]._id, status: 'REJECTED' },
      { document: documents[3]._id, reviewer: reviewers[3]._id, status: 'APPROVED' },

      // Document 5: User Manual v2.0 (IN_REVIEW) - mixed
      { document: documents[4]._id, reviewer: reviewers[1]._id, status: 'PENDING' },
      { document: documents[4]._id, reviewer: reviewers[3]._id, status: 'APPROVED' },
      { document: documents[4]._id, reviewer: reviewers[4]._id, status: 'PENDING' },
    ];

    await Review.insertMany(reviews);

    // Update document statuses based on reviews
    for (const doc of documents) {
      await documentService.updateDocumentStatus(doc._id);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;