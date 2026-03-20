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
    
    // Listen for dashboard refresh events from other components
    const handleRefresh = () => {
      console.log('Dashboard refresh triggered');
      fetchData();
    };
    
    window.addEventListener('dashboard-refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('dashboard-refresh', handleRefresh);
    };
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative">
        {/* Enhanced Header - Light UI */}
        <div className="mb-10">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">📊 Dashboard</h1>
                <p className="text-gray-600 text-lg font-medium">Manage and track your document reviews with ease</p>
              </div>
              <div className="hidden md:block">
                <div className="text-8xl opacity-20 transform rotate-12">📄</div>
              </div>
            </div>
          </div>
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

      {/* Enhanced Status Cards - Light UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Documents Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Documents</h2>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">{data.totalDocuments}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-3">📄</div>
          </div>
        </div>

        {data.statusCounts && data.statusCounts.length > 0 ? (
          data.statusCounts.map(count => (
            <div key={count._id} className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
              count._id === 'DRAFT' ? 'border-l-4 border-gray-500' :
              count._id === 'IN_REVIEW' ? 'border-l-4 border-yellow-500' :
              count._id === 'APPROVED' ? 'border-l-4 border-green-500' :
              'border-l-4 border-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{count._id.replace('_', ' ')}</h2>
                  <p className={`text-4xl font-bold mt-2 ${
                    count._id === 'DRAFT' ? 'text-gray-600' :
                    count._id === 'IN_REVIEW' ? 'text-yellow-600' :
                    count._id === 'APPROVED' ? 'text-green-600' :
                    'text-red-600'
                  }`}>{count.count}</p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform -rotate-3 ${
                  count._id === 'DRAFT' ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                  count._id === 'IN_REVIEW' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                  count._id === 'APPROVED' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' :
                  'bg-gradient-to-br from-red-400 to-red-500 text-white'
                }`}>
                  {count._id === 'DRAFT' ? '📝' : count._id === 'IN_REVIEW' ? '⏳' : count._id === 'APPROVED' ? '✅' : '❌'}
                </div>
              </div>
            </div>
          ))
        ) : (
          // Show all statuses with 0 if no data
          <>            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-l-4 border-gray-500 border border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">DRAFT</h2>
                  <p className="text-4xl font-bold text-gray-600 mt-2">0</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform -rotate-3">📝</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-l-4 border-yellow-500 border border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">IN REVIEW</h2>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">0</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform -rotate-3">⏳</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-l-4 border-green-500 border border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">APPROVED</h2>
                  <p className="text-4xl font-bold text-green-600 mt-2">0</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform -rotate-3">✅</div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-l-4 border-red-500 border border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">REJECTED</h2>
                  <p className="text-4xl font-bold text-red-600 mt-2">0</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform -rotate-3">❌</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pending Reviewers Section - Safety Check */}
      {data.numberOfPendingReviewers !== undefined && data.numberOfPendingReviewers > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">⏳ Pending Reviewers ({data.numberOfPendingReviewers})</h2>
          {data.listOfPendingReviewers && data.listOfPendingReviewers.length > 0 ? (
            <ul className="space-y-2">
              {data.listOfPendingReviewers.map((name, index) => (
                <li key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {name && name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-800 font-medium">{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No pending reviewers</p>
          )}
        </div>
      )}

      {/* Enhanced Search & Filter - Light UI */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="🔍 Search documents by title..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all"
          />
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="border-2 border-gray-200 p-4 px-6 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all font-medium"
          >
            <option value="">All Status</option>
            <option value="DRAFT">📝 Draft</option>
            <option value="IN_REVIEW">⏳ In Review</option>
            <option value="APPROVED">✅ Approved</option>
            <option value="REJECTED">❌ Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table - Enhanced Light UI */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">📄 All Documents</h2>
            <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
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
              <tr key={doc._id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                <td className="p-5 text-gray-800 font-medium">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mr-4 shadow-sm group-hover:shadow-md transition-shadow">
                      📄
                    </div>
                    <span className="text-lg">{doc.title}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${statusColors[doc.status]}`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex gap-2">
                    <Link 
                      to={`/review/${doc._id}`} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      👁️ Review
                    </Link>
                    <button 
                      onClick={() => handleDelete(doc._id, doc.title)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
};

export default Dashboard;