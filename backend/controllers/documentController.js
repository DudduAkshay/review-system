const documentService = require('../services/documentService');
const Document = require('../models/Document');
const Review = require('../models/Review');
const Reviewer = require('../models/Reviewer');
const ActivityLog = require('../models/ActivityLog');
const fs = require('fs');
const path = require('path');

class DocumentController {
  async getAllDocuments(req, res) {
    try {
      const documents = await documentService.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDocumentById(req, res) {
    try {
      const { id } = req.params;
      const data = await documentService.getDocumentById(id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createDocument(req, res) {
    try {
      let { title, reviewerIds } = req.body;
      const file = req.file ? req.file.filename : null;

      console.log('\n=== DOCUMENT CREATION REQUEST ===');
      console.log('Raw reviewerIds from request:', reviewerIds);
      console.log('Type of reviewerIds:', typeof reviewerIds);

      // Parse reviewerIds if it's a JSON string (from FormData)
      if (typeof reviewerIds === 'string') {
        try {
          reviewerIds = JSON.parse(reviewerIds);
          console.log('Parsed reviewerIds:', reviewerIds);
        } catch (e) {
          console.error('Failed to parse reviewerIds:', e);
          return res.status(400).json({ error: 'Invalid reviewerIds format' });
        }
      }

      // Validation: Check title is provided
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Document title is required' });
      }

      // Validation: Check reviewerIds is an array
      if (!Array.isArray(reviewerIds)) {
        return res.status(400).json({ error: 'reviewerIds must be an array' });
      }

      // Filter out null/undefined reviewer IDs and remove duplicates
      const validReviewerIds = reviewerIds.filter(id => id && String(id).trim().length > 0);
      const uniqueReviewerIds = [...new Set(validReviewerIds)];

      console.log('Valid reviewerIds after filtering:', validReviewerIds);
      console.log('Unique reviewerIds:', uniqueReviewerIds);

      // Validation: Reject if no reviewers provided
      if (uniqueReviewerIds.length === 0) {
        return res.status(400).json({ error: 'At least one reviewer is required' });
      }

      if (uniqueReviewerIds.length !== validReviewerIds.length) {
        return res.status(400).json({ error: 'Duplicate reviewer IDs are not allowed' });
      }

      // Validation: Check if all reviewer IDs exist
      let reviewers = [];
      if (uniqueReviewerIds.length > 0) {
        reviewers = await Reviewer.find({ _id: { $in: uniqueReviewerIds } });
        console.log('Found reviewers in database:', reviewers.map(r => ({ id: r._id, name: r.name })));
            
        if (reviewers.length !== uniqueReviewerIds.length) {
          const foundIds = reviewers.map(r => r._id.toString());
          const missingIds = uniqueReviewerIds.filter(id => !foundIds.includes(id));
          console.error('Missing reviewer IDs:', missingIds);
          return res.status(400).json({ error: 'One or more reviewer IDs do not exist' });
        }
      }
      
      // FIRST: Create document with DRAFT status initially
      const document = await Document.create({
        title: title.trim(),
        file,
        status: 'DRAFT', // Always start as DRAFT
      });

      console.log('Created document:', document._id, document.title);

      // SECOND: Create review entries only if document was saved successfully
      if (document && document._id) {
        const reviews = uniqueReviewerIds.map(reviewerId => ({
          document: document._id,
          reviewer: reviewerId,
          status: 'PENDING',
        }));

        console.log('Creating reviews for document:', document._id);
        console.log('Selected reviewer IDs:', uniqueReviewerIds);
        console.log('Reviews to create:', JSON.stringify(reviews, null, 2));
        try {
          // Use ordered:false to continue on duplicates and surface other errors
          await Review.insertMany(reviews, { ordered: false });
          console.log('✅ Reviews created successfully:', reviews.length, 'reviews for', uniqueReviewerIds.length, 'reviewers');
          console.log('Review IDs created:', reviews.map(r => r.reviewer));
        } catch (err) {
          console.error('Review.insertMany error:', err.message || err);
          // If duplicate key errors occur, try creating individually and ignore duplicates
          for (const r of reviews) {
            try {
              await Review.create(r);
            } catch (individualErr) {
              // Ignore duplicate key errors for idempotency
              if (individualErr.code === 11000) {
                console.warn('Duplicate review ignored for', r.reviewer);
              } else {
                console.error('Failed to create review:', individualErr);
              }
            }
          }
        }
      }

      res.status(201).json({
        _id: document._id,
        title: document.title,
        file: document.file,
        status: document.status,
        createdAt: document.createdAt,
      });
      
      console.log('✅ DOCUMENT CREATION COMPLETED');
      console.log('Document ID:', document._id);
      console.log('Document Title:', document.title);
      console.log('Assigned Reviewers:', uniqueReviewerIds.length);
      console.log('===============================\n');
    } catch (error) {
      console.error('Document creation error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      console.log('Delete request for document ID:', id);

      // Get document
      const document = await Document.findById(id);
      if (!document) {
        console.log('Document not found:', id);
        return res.status(404).json({ error: 'Document not found' });
      }

      console.log('Found document:', document.title);

      // Delete associated reviews
      const deletedReviews = await Review.deleteMany({ document: id });
      console.log('Deleted reviews:', deletedReviews.deletedCount);

      // Delete uploaded file if it exists
      if (document.file) {
        const filePath = path.join(__dirname, '../uploads', document.file);
        console.log('Attempting to delete file:', filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted successfully');
        } else {
          console.log('File not found:', filePath);
        }
      }

      // Delete document
      await Document.findByIdAndDelete(id);
      console.log('Document deleted from database');

      // Add activity log
      try {
        await ActivityLog.create({ message: `Document "${document.title}" has been deleted` });
        console.log('Activity log created');
      } catch (logError) {
        console.error('Failed to create activity log:', logError);
        // Don't fail the whole operation for logging error
      }

      console.log('Delete operation completed successfully');
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DocumentController();