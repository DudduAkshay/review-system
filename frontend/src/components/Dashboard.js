import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get(`${API_BASE}/api/dashboard`)
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  };

  if (!data) return <div className="text-center py-10">Loading...</div>;

  const filteredDocuments = data.documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === '' || doc.status === filter)
  );

  const statusColors = {
    DRAFT: 'bg-gray-200 text-gray-800',
    IN_REVIEW: 'bg-yellow-200 text-yellow-800',
    APPROVED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800',
  };

  const handleDelete = (docId, docTitle) => {
    setDeleteConfirm({ id: docId, title: docTitle });
  };

  const confirmDelete = () => {
    if (!deleteConfirm || deleting) return; // Prevent multiple requests
    setDeleting(true);
    console.log('Starting delete process for:', deleteConfirm.id);

    console.log('Making axios request to:', `${API_BASE}/api/documents/${deleteConfirm.id}`);

    // Try using fetch instead of axios
    console.log('Using fetch API for delete request');

    fetch(`${API_BASE}/api/documents/${deleteConfirm.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Delete successful with fetch:', data);
        setDeleting(false);
        setDeleteConfirm(null);
        setDeleteSuccess({ message: `Document "${deleteConfirm.title}" deleted successfully!` });
        fetchData();
        setTimeout(() => setDeleteSuccess(null), 3000);
      })
      .catch(error => {
        console.error('Delete failed with fetch:', error);
        alert(`Delete failed: ${error.message}`);
        setDeleting(false);
        setDeleteConfirm(null);
      });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Dashboard</h1>
        <p className="text-gray-600">Manage and track your document reviews</p>
      </div>

      {deleteSuccess && (
        <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg animate-slide-in">
          <div className="flex items-start">
            <div className="text-3xl mr-4">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">{deleteSuccess.message}</h3>
              <p className="text-green-700 text-sm">The document and all associated data have been permanently removed.</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold opacity-90">Total Documents</h2>
              <p className="text-3xl font-bold">{data.totalDocuments}</p>
            </div>
            <div className="text-4xl opacity-75">📄</div>
          </div>
        </div>
        {data.statusCounts.map(count => (
          <div key={count._id} className={`p-6 rounded-xl shadow-lg text-white ${
            count._id === 'DRAFT' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
            count._id === 'IN_REVIEW' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
            count._id === 'APPROVED' ? 'bg-gradient-to-r from-green-500 to-green-600' :
            'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold opacity-90">{count._id}</h2>
                <p className="text-3xl font-bold">{count.count}</p>
              </div>
              <div className="text-4xl opacity-75">
                {count._id === 'DRAFT' ? '📝' : count._id === 'IN_REVIEW' ? '⏳' : count._id === 'APPROVED' ? '✅' : '❌'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Reviewers Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">⏳ Pending Reviewers ({data.numberOfPendingReviewers})</h2>
        {data.pendingReviewers && data.pendingReviewers.length === 0 ? (
          <p className="text-gray-600">No pending reviewers</p>
        ) : (
          <ul className="space-y-2">
            {data.pendingReviewers.map(reviewer => (
              <li key={reviewer._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {reviewer.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-800 font-medium">{reviewer.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input 
          type="text" 
          placeholder="🔍 Search by title..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">📋 Documents</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700">Title</th>
              <th className="p-4 text-left font-semibold text-gray-700">Status</th>
              <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map(doc => (
              <tr key={doc._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-800 font-medium">{doc.title}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[doc.status]}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link to={`/review/${doc._id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md">
                      Review
                    </Link>
                    <button 
                      onClick={() => handleDelete(doc._id, doc.title)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">👥 Pending Reviewers</h2>
          <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
            {data.numberOfPendingReviewers}
          </span>
        </div>
        <ul className="space-y-2">
          {data.listOfPendingReviewers.map(name => (
            <li key={name} className="flex items-center text-gray-700">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
              {name}
            </li>
          ))}
        </ul>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-6">🗑️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Document</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-red-600">"{deleteConfirm.title}"</span>?
                  <br />
                  <span className="text-sm text-gray-500 mt-2 block">
                    This will permanently remove the document, its uploaded file, and all associated reviews.
                  </span>
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                      deleting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {deleting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      '🗑️ Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;