import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const ReviewPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    axios.get(`${API_BASE}/api/documents/${id}`)
      .then(response => {
        console.log('Fetched document data:', response.data);
        console.log('Reviews in document:', response.data.reviews);
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching document:', error);
        setError('Failed to load document');
        setLoading(false);
      });
  }, [id]);

  const fetchReviewers = useCallback(() => {
    axios.get(`${API_BASE}/api/reviewers`)
      .then(response => {
        console.log('Fetched reviewers:', response.data);
        setReviewers(response.data);
      })
      .catch(error => console.error('Failed to load reviewers:', error));
  }, []);

  useEffect(() => {
    fetchData();
    fetchReviewers();
  }, [fetchData, fetchReviewers]);

  const handleAction = (status) => {
    setAction(status);
    setShowConfirm(true);
    setError('');
  };

  const confirmAction = () => {
    if (!selectedReviewerId) {
      setError('Please select a reviewer first');
      return;
    }

    const review = data.reviews.find(r => r.reviewer._id === selectedReviewerId);
    
    if (!review) {
      setError('No review found for this reviewer');
      return;
    }
    
    if (review.status !== 'PENDING') {
      setError(`Cannot submit. Review has already been ${review.status.toLowerCase()}.`);
      return;
    }

    axios.put(`${API_BASE}/api/reviews/${review._id}`, { 
      status: action,
      reviewerId: selectedReviewerId
    })
      .then((response) => {
        alert(`Successfully ${action.toLowerCase()}ed the document!`);
        fetchData();
        setShowConfirm(false);
        setError('');
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      })
      .catch(error => {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to update review';
        console.error('Error updating review:', error);
        setError(errorMsg);
      });
  };

  if (loading || !data) return <div className="text-center py-10">Loading...</div>;

  const myReview = selectedReviewerId ? data.reviews.find(r => r.reviewer._id === selectedReviewerId) : null;
  const completed = data.reviews.filter(r => r.status !== 'PENDING').length;
  const total = data.reviews.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-100">
      <div className="relative max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
        ← Back to Dashboard
      </Link>
      
      {/* Reviewer Selector */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Select Reviewer</h2>
        <select
          value={selectedReviewerId}
          onChange={(e) => {
            const selectedId = e.target.value;
            console.log('Reviewer selector changed to:', selectedId);
            setSelectedReviewerId(selectedId);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Select a reviewer --</option>
          {reviewers.map(reviewer => (
            <option key={reviewer._id} value={reviewer._id}>
              {reviewer.name}
            </option>
          ))}
        </select>
        {!selectedReviewerId && (
          <p className="text-sm text-gray-500 mt-2">Please select a reviewer to view and submit reviews.</p>
        )}
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.document.title}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                data.document.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                data.document.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                data.document.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.document.status}
              </span>
              {data.document.file && (
                <a href={`${API_BASE}/uploads/${data.document.file}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  📎 Download File
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-gray-700">Review Progress</span>
            <span className="text-sm text-gray-500">{completed}/{total} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500" 
                 style={{ width: `${(completed / total) * 100}%` }}></div>
          </div>
        </div>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">👥 Reviewers</h2>
        <div className="space-y-4">
          {data.reviews && data.reviews.length > 0 ? (
            data.reviews.map(review => {
              // Safety check for null reviewer
              if (!review || !review.reviewer) {
                return null;
              }
              
              return (
                <div key={review._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-4">
                      {review.reviewer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{review.reviewer.name}</span>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    review.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                    review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {review.status}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-yellow-800 font-semibold">⚠️ No reviewers assigned</p>
              <p className="text-sm text-yellow-700 mt-1">This document has not been assigned to any reviewers yet.</p>
            </div>
          )}
        </div>
        {selectedReviewerId && myReview && myReview.status === 'PENDING' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Decision</h3>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleAction('APPROVED')} 
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
              >
                ✅ Approve
              </button>
              <button 
                onClick={() => handleAction('REJECTED')} 
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}
        {selectedReviewerId && myReview && myReview.status !== 'PENDING' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className={`p-4 rounded-lg ${
              myReview.status === 'APPROVED' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="font-semibold">✓ You have already {myReview.status.toLowerCase()} this document</p>
            </div>
          </div>
        )}
        {selectedReviewerId && !myReview && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="p-4 rounded-lg bg-gray-50 text-gray-800 border border-gray-200">
              <p className="font-semibold">ℹ️ You are not assigned to review this document</p>
            </div>
          </div>
        )}
        {!selectedReviewerId && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
              <p className="font-semibold">⚠️ Please select a reviewer above to view your review options</p>
            </div>
          </div>
        )}
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">⚠️ {error}</p>
              </div>
            )}
            <div className="text-center">
              <div className="text-4xl mb-4">
                {action === 'APPROVED' ? '✅' : '❌'}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Action</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to {action.toLowerCase()} this document?</p>
              <div className="flex space-x-4">
                <button 
                  onClick={confirmAction} 
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    action === 'APPROVED' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Yes, {action.toLowerCase()}
                </button>
                <button 
                  onClick={() => { setShowConfirm(false); setError(''); }} 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ReviewPage;