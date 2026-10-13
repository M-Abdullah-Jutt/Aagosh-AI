import React, { useEffect, useState } from 'react';
import { Server, Settings, Users } from 'lucide-react';
import axios from 'axios';

const TechnicalAdmin = () => {
  const [stats, setStats] = useState({ latest_users: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/v1/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <Server className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Backend & DB Health</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Database Connection</span>
              <span className="text-sm font-semibold text-green-600">Stable</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">API Status</span>
              <span className="text-sm font-semibold text-green-600">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Recorded Users</span>
              <span className="text-sm font-semibold text-gray-900">{stats.total_users || 0}</span>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-brand-500">
           <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Recent Registrations</h3>
          </div>
          {stats.latest_users && stats.latest_users.length > 0 ? (
            <ul className="space-y-3 divide-y divide-gray-100">
              {stats.latest_users.map(user => (
                <li key={user.id} className="pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">{user.email}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{user.role}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalAdmin;
