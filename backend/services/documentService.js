const Document = require('../models/Document');
const Review = require('../models/Review');

class DocumentService {
  async getAllDocuments() {
    return await Document.find();
  }

  async getDocumentById(id) {
    console.log('\n=== FETCHING DOCUMENT BY ID ===');
    console.log('Document ID:', id);
    
    const document = await Document.findById(id);
    console.log('Found document:', document ? { title: document.title, status: document.status } : 'NOT FOUND');
    
    const reviews = await Review.find({ document: id }).populate('reviewer');
    console.log('Found reviews:', reviews.length);
    console.log('Reviews:', reviews.map(r => ({ 
      reviewer: r.reviewer?.name || 'NO REVIEWER', 
      status: r.status 
    })));
    
    return { document, reviews };
  }

  async updateDocumentStatus(documentId) {
    // Validation: Check documentId is provided and valid
    if (!documentId || String(documentId).trim().length === 0) {
      throw new Error('Document ID is required');
    }

    // Get the document first
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    console.log('\n=== UPDATING DOCUMENT STATUS ===');
    console.log('Current document status:', document.status);

    // Fetch all reviews for the document
    const reviews = await Review.find({ document: documentId });
    console.log('Total reviews:', reviews.length);
    
    // Determine status based on review statuses
    let newStatus;
    if (reviews.length > 0) {
      // Rule 1: If ANY review is REJECTED → document = REJECTED
      if (reviews.some(review => review.status === 'REJECTED')) {
        newStatus = 'REJECTED';
      } 
      // Rule 2: Else if ALL reviews are APPROVED → document = APPROVED
      else if (reviews.every(review => review.status === 'APPROVED')) {
        newStatus = 'APPROVED';
      } 
      // Rule 3: Else → document = IN_REVIEW
      else {
        newStatus = 'IN_REVIEW';
      }
    } else {
      // No reviews yet, keep as DRAFT
      newStatus = 'DRAFT';
    }

    // Special case: If document is DRAFT and first review decision is made (not all approved), move to IN_REVIEW
    // This prevents DRAFT → IN_REVIEW when document should go directly to APPROVED
    if (document.status === 'DRAFT' && newStatus !== 'DRAFT') {
      // Only force IN_REVIEW if not all reviewers have approved yet
      const allHaveDecided = reviews.every(r => r.status !== 'PENDING');
      if (!allHaveDecided || newStatus === 'IN_REVIEW') {
        newStatus = 'IN_REVIEW';
      }
    }

    console.log('New document status will be:', newStatus);

    // Update and return the updated document
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId, 
      { status: newStatus }, 
      { new: true }
    );

    console.log('✅ Document status updated from', document.status, 'to', newStatus);

    return updatedDocument;
  }
}

module.exports = new DocumentService();