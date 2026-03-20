import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const CreateDocument = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/api/reviewers`)
      .then(response => setReviewers(response.data))
      .catch(error => {
        console.error(error);
        setError('Failed to load reviewers');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('\n=== FORM SUBMISSION ===');
    console.log('Selected reviewers:', selectedReviewers);
    console.log('Selected reviewer IDs:', selectedReviewers.map(r => r._id));

    if (!title.trim()) {
      setError('Please enter a document title');
      setLoading(false);
      return;
    }

    if (!file) {
      setError('Please select a file');
      setLoading(false);
      return;
    }

    if (selectedReviewers.length === 0) {
      setError('Please select at least one reviewer');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    
    const reviewerIdsArray = selectedReviewers.map(r => r._id);
    console.log('Sending reviewerIds:', reviewerIdsArray);
    console.log('Stringified reviewerIds:', JSON.stringify(reviewerIdsArray));
    
    formData.append('reviewerIds', JSON.stringify(reviewerIdsArray));

    console.log('Submitting form with reviewerIds:', selectedReviewers.map(r => r._id));

    axios.post(`${API_BASE}/api/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        setSuccess({ message: 'Document created successfully!' });
        setTimeout(() => {
          navigate('/');
        }, 3000);
      })
      .catch(error => {
        const errorMsg = error.response?.data?.error || error.message || 'Failed to create document';
        console.error('Error creating document:', error);
        setError(errorMsg);
        setLoading(false);
      });
  };

  const handleReviewerChange = (reviewer) => {
    setSelectedReviewers(prev => 
      prev.find(r => r._id === reviewer._id) 
        ? prev.filter(r => r._id !== reviewer._id)
        : [...prev, reviewer]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <div className="relative">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Create New Document</h1>
        <p className="text-gray-600">Upload a document and assign reviewers for review</p>
      </div>

      {success && (
        <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg animate-slide-in">
          <div className="flex items-start">
            <div className="text-3xl mr-4">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">{success.message}</h3>
              <p className="text-green-700 text-sm">Redirecting to dashboard in 3 seconds...</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            � Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            �📎 Select Document File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input 
              type="file" 
              onChange={e => setFile(e.target.files[0])} 
              required 
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-500 mb-2">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">PDF, DOC, DOCX up to 10MB</p>
            </label>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            👥 Select Reviewers
          </label>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {reviewers.map(reviewer => (
              <label key={reviewer._id} className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer border-2 ${
                selectedReviewers.some(r => r._id === reviewer._id) 
                  ? 'bg-blue-50 border-blue-500' 
                  : 'bg-gray-50 border-transparent hover:bg-gray-100'
              }`}>
                <input 
                  type="checkbox" 
                  checked={selectedReviewers.some(r => r._id === reviewer._id)}
                  onChange={() => handleReviewerChange(reviewer)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {reviewer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{reviewer.name}</span>
                </div>
                {selectedReviewers.some(r => r._id === reviewer._id) && (
                  <span className="text-blue-600 text-sm font-semibold">✓ Selected</span>
                )}
              </label>
            ))}
          </div>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">⚠️ {error}</p>
          </div>
        )}
        <button 
          type="submit"
          disabled={loading || !title.trim() || !file || selectedReviewers.length === 0}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
            loading || !title.trim() || !file || selectedReviewers.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
          }`}
        >
          {loading ? '⏳ Creating...' : '🚀 Create Document'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default CreateDocument;