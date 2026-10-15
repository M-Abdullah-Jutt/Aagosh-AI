import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, PieChart, ShieldCheck } from 'lucide-react';
import apiClient from '../../services/api';

const Overview = () => {
  const [dbStats, setDbStats] = useState({
    total_users: 0,
    active_users: 0,
    total_children: 0,
    system_health: '99.9%',
    total_checkins: 0,
    total_conversations: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/stats');
        setDbStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { name: 'Total Users', stat: dbStats.total_users, icon: Users, color: 'bg-brand-500' },
    { name: 'Active Users', stat: dbStats.active_users, icon: CheckCircle, color: 'bg-green-500' },
    { name: 'Total Children', stat: dbStats.total_children, icon: PieChart, color: 'bg-purple-500' },
    { name: 'System Health', stat: dbStats.system_health, icon: ShieldCheck, color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            </dd>
          </div>
        ))}
      </div>
      
      {/* Recent Activity Mock */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Platform Activity</h3>
        <ul className="divide-y divide-gray-200">
          {[
            { id: 1, text: `Database recorded ${dbStats.total_users} total users`, time: 'Real-time', type: 'user' },
            { id: 2, text: `System shows ${dbStats.total_children} child profiles managed`, time: 'Real-time', type: 'system' },
            { id: 3, text: `Total check-ins completed: ${dbStats.total_checkins}`, time: 'Real-time', type: 'product' },
            { id: 4, text: `Total AI coach conversations: ${dbStats.total_conversations}`, time: 'Real-time', type: 'product' },
          ].map((activity) => (
            <li key={activity.id} className="py-4 flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Overview;
