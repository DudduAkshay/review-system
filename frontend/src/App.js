import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ReviewPage from './components/ReviewPage';
import CreateDocument from './components/CreateDocument';
import ReviewerInsights from './components/ReviewerInsights';
import ActivityPage from './components/ActivityPage';
import ReviewerView from './components/ReviewerView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">📄 Document Review System</h1>
            <div className="space-x-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
              <Link to="/reviewer-view" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Reviewer View</Link>
              <Link to="/create" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Create Document</Link>
              <Link to="/reviewers" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Reviewer Insights</Link>
              <Link to="/activities" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Activities</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/create" element={<CreateDocument />} />
            <Route path="/reviewers" element={<ReviewerInsights />} />
            <Route path="/reviewer-view" element={<ReviewerView />} />
            <Route path="/activities" element={<ActivityPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;