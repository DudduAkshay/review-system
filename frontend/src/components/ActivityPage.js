import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/activities`)
      .then(response => setActivities(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Recent Activities</h1>
        <p className="text-gray-600">Track all document review activities and changes</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">No activities yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity._id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {activity.message.includes('created') ? '📝' : 
                       activity.message.includes('approved') ? '✅' : 
                       activity.message.includes('rejected') ? '❌' : '📋'}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 font-medium">{activity.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;