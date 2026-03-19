import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const ReviewerInsights = () => {
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [reviewerDetails, setReviewerDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewers();
  }, []);

  useEffect(() => {
    if (selectedReviewer) {
      fetchReviewerDetails(selectedReviewer._id);
    }
  }, [selectedReviewer]);

  const fetchReviewers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/reviewers`);
      setReviewers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviewers:', error);
      setLoading(false);
    }
  };

  const fetchReviewerDetails = async (reviewerId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/reviews/reviewer/${reviewerId}`);
      setReviewerDetails(response.data);
    } catch (error) {
      console.error('Error fetching reviewer details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">👥 Reviewer Insights</h1>
        <p className="text-gray-600">Track reviewer performance and workload</p>
      </div>

      {!selectedReviewer ? (
        reviewers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No reviewers available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reviewers.map(reviewer => (
              <div
                key={reviewer._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedReviewer(reviewer)}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {reviewer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{reviewer.name}</h3>
                    <p className="text-sm text-gray-500">Reviewer</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">📋 Assigned Documents</span>
                    <span className="font-semibold text-gray-800">{reviewer.totalAssigned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">⏳ Pending Reviews</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reviewer.pendingReviews > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {reviewer.pendingReviews}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <div className="mb-6">
            <button
              onClick={() => { setSelectedReviewer(null); setReviewerDetails(null); }}
              className="text-blue-500 hover:underline mb-4 inline-block"
            >
              ← Back to All Reviewers
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">{selectedReviewer.name}'s Details</h2>
          </div>

          {reviewerDetails && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Assigned Documents</h3>
                {reviewerDetails.length === 0 ? (
                  <p className="text-gray-600">No documents assigned to this reviewer.</p>
                ) : (
                  <div className="space-y-4">
                    {reviewerDetails.map(document => (
                      <div key={document._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-800">{document.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
                            {document.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Document Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(document.status)}`}>
                              {document.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Your Decision:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(document.reviewStatus)}`}>
                              {document.reviewStatus === 'PENDING' ? 'Not yet decided' : document.reviewStatus}
                            </span>
                          </div>
                        </div>
                        {document.reviewStatus !== 'PENDING' && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              <strong>Activity:</strong> You {document.reviewStatus.toLowerCase()} "{document.title}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Summary Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reviewerDetails.length}</div>
                    <div className="text-sm text-blue-800">Total Assigned</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {reviewerDetails.filter(r => r.status === 'PENDING').length}
                    </div>
                    <div className="text-sm text-yellow-800">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {reviewerDetails.filter(r => r.status !== 'PENDING').length}
                    </div>
                    <div className="text-sm text-green-800">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedReviewer && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">📊 Overall Statistics</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">Reviewer</th>
                <th className="p-4 text-left font-semibold text-gray-700">Assigned Documents</th>
                <th className="p-4 text-left font-semibold text-gray-700">Pending Reviews</th>
                <th className="p-4 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {reviewers.map(reviewer => (
                <tr key={reviewer._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {reviewer.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{reviewer.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{reviewer.totalAssigned}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reviewer.pendingReviews > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {reviewer.pendingReviews}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reviewer.pendingReviews === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {reviewer.pendingReviews === 0 ? 'Available' : 'Busy'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewerInsights;