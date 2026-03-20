import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const ReviewerView = () => {
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [reviewerDocuments, setReviewerDocuments] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviewers();
  }, []);

  useEffect(() => {
    if (selectedReviewer) {
      fetchReviewerDocuments(selectedReviewer._id);
    }
  }, [selectedReviewer]);

  const fetchReviewers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/reviewers`);
      setReviewers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviewers:', error);
      setError('Failed to load reviewers. Please check if the backend server is running.');
      setLoading(false);
    }
  };

  const fetchReviewerDocuments = async (reviewerId) => {
    try {
      // Use the correct endpoint to get reviewer's assigned documents
      const response = await axios.get(`${API_BASE}/api/reviewers/${reviewerId}/documents`);
      console.log('Fetched documents for reviewer:', reviewerId, response.data);
      setReviewerDocuments(response.data.filter(r => r.document !== null)); // Filter out null documents
    } catch (error) {
      console.error('Error fetching reviewer documents:', error);
      setError('Failed to load reviewer documents.');
      setReviewerDocuments([]);
    }
  };

  const handleReviewAction = async (reviewId, status) => {
    try {
      // Get the reviewerId from the review object
      const review = reviewerDocuments.find(r => r._id === reviewId);
      const reviewerId = review?.reviewer?._id;
      
      if (!reviewerId) {
        setError('Reviewer information not available');
        return;
      }
      
      await axios.put(`${API_BASE}/api/reviews/${reviewId}`, { 
        status,
        reviewerId 
      });
      
      // Show success message
      alert(`Successfully ${status.toLowerCase()}ed the document!`);
      
      // Refresh the documents
      if (selectedReviewer) {
        await fetchReviewerDocuments(selectedReviewer._id);
      }
      
      // Also trigger a dashboard refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      
    } catch (error) {
      console.error('Error updating review:', error);
      setError(error.response?.data?.error || 'Failed to update review status.');
    }
  };

  const statusColors = {
    DRAFT: 'bg-gray-200 text-gray-800',
    IN_REVIEW: 'bg-yellow-200 text-yellow-800',
    APPROVED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800',
  };

  const reviewStatusColors = {
    PENDING: 'bg-blue-200 text-blue-800',
    APPROVED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800',
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold mb-4">Reviewer View</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={fetchReviewers}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      <div className="relative container mx-auto p-4">
        <div className="mb-8">
        <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-4">Reviewer View</h1>
      </div>

      {!selectedReviewer ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Reviewer</h2>
          {reviewers.length === 0 ? (
            <p className="text-gray-600">No reviewers available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviewers.map(reviewer => (
                <div
                  key={reviewer._id}
                  className="bg-white border p-4 rounded shadow cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-400"
                  onClick={() => {
                    console.log('Selected reviewer:', reviewer.name, reviewer._id);
                    setSelectedReviewer(reviewer);
                  }}
                >
                  <h3 className="font-semibold">{reviewer.name}</h3>
                  <p className="text-sm text-gray-600">Total Assigned: {reviewer.totalAssigned}</p>
                  <p className="text-sm text-gray-600">Pending: {reviewer.pendingReviews}</p>
                  {reviewer.totalAssigned > 0 && (
                    <p className="text-xs text-blue-600 mt-2">Click to view documents</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Reviewer: {selectedReviewer.name}</h2>
            <button
              onClick={() => setSelectedReviewer(null)}
              className="text-blue-500 hover:underline"
            >
              Change Reviewer
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assigned Documents</h3>
            {reviewerDocuments === null ? (
              <p className="text-gray-600">Loading documents...</p>
            ) : reviewerDocuments.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-yellow-800 font-semibold">No documents assigned</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This reviewer has not been assigned to any documents yet.
                </p>
              </div>
            ) : (
              reviewerDocuments.map(review => {
                // Safety check for null document
                if (!review.document) {
                  return null;
                }
                
                return (
                  <div key={review._id} className="bg-white border p-4 rounded shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{review.document.title}</h4>
                      <span className={`px-2 py-1 rounded text-sm ${statusColors[review.document.status]}`}>
                        {review.document.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Your Review Status: <span className={`px-2 py-1 rounded text-xs ${reviewStatusColors[review.status]}`}>
                        {review.status}
                      </span>
                    </p>
                    {review.status === 'PENDING' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReviewAction(review._id, 'APPROVED')}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewAction(review._id, 'REJECTED')}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p>Decision already submitted: <strong>{review.status}</strong></p>
                        <p className="text-xs text-gray-500 mt-1">Actions are disabled</p>
                      </div>
                    )}
                    <Link
                      to={`/review/${review.document._id}`}
                      className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                    >
                      View Document Details
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ReviewerView;