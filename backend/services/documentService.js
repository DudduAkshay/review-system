const Document = require('../models/Document');
const Review = require('../models/Review');

class DocumentService {
  async getAllDocuments() {
    return await Document.find();
  }

  async getDocumentById(id) {
    const document = await Document.findById(id);
    const reviews = await Review.find({ document: id }).populate('reviewer');
    return { document, reviews };
  }

  async updateDocumentStatus(documentId) {
    // Validation: Check documentId is provided and valid
    if (!documentId || String(documentId).trim().length === 0) {
      throw new Error('Document ID is required');
    }

    // Fetch all reviews for the document
    const reviews = await Review.find({ document: documentId });
    
    // Determine status based on review statuses
    let status = 'DRAFT';
    if (reviews.length > 0) {
      // Rule 1: If ANY review is REJECTED → document = REJECTED
      if (reviews.some(review => review.status === 'REJECTED')) {
        status = 'REJECTED';
      } 
      // Rule 2: Else if ALL reviews are APPROVED → document = APPROVED
      else if (reviews.every(review => review.status === 'APPROVED')) {
        status = 'APPROVED';
      } 
      // Rule 3: Else → document = IN_REVIEW
      else {
        status = 'IN_REVIEW';
      }
    }

    // Update and return the updated document
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId, 
      { status }, 
      { new: true }
    );

    return updatedDocument;
  }
}

module.exports = new DocumentService();