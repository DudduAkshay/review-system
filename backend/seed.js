const mongoose = require('mongoose');
const Document = require('./models/Document');
const Reviewer = require('./models/Reviewer');
const Review = require('./models/Review');
const documentService = require('./services/documentService');

const seedDatabase = async () => {
  try {
    // Check if reviewers already exist
    const reviewerCount = await Reviewer.countDocuments();
    if (reviewerCount > 0) {
      console.log('Reviewers already exist in database');
      return;
    }
    
    // Clear existing data (only if no reviewers exist)
    await Document.deleteMany({});
    await Review.deleteMany({});

    // Create ONLY reviewers - documents will be created by users
    const reviewers = await Reviewer.insertMany([
      { name: 'Alice Johnson' },
      { name: 'Bob Smith' },
      { name: 'Charlie Brown' },
      { name: 'Diana Prince' },
      { name: 'Eve Wilson' }
    ]);

    console.log(`Created ${reviewers.length} reviewers`);
    console.log('Documents will be created by users dynamically');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;