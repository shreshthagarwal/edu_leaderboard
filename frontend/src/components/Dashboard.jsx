import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const domainNames = {
  webd: 'Web Development',
  aiml: 'AI/ML',
  dsa: 'Data Structures & Algorithms',
  tasks: 'My Tasks'
};

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [points, setPoints] = useState(0);
  const { user, logout } = useAuth();
  const domains = ['webd', 'aiml', 'dsa', 'tasks'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Only fetch leaderboard data for domain tabs (not for tasks)
        const leaderboardPromises = domains
          .filter(domain => domain !== 'tasks')
          .map(domain => 
            axios.get(`http://localhost:5000/api/leaderboard/${domain}`)
              .catch(error => {
                console.error(`Error fetching ${domain} leaderboard:`, error);
                return { data: { success: true, data: [] } }; // Return empty data on error
              })
          );
        
        const leaderboardResults = await Promise.all(leaderboardPromises);
        const leaderboardMap = {};
        
        domains.filter(domain => domain !== 'tasks').forEach((domain, index) => {
          leaderboardMap[domain] = leaderboardResults[index]?.data?.data || [];
        });
        
        setLeaderboardData(leaderboardMap);
        
        // Fetch user tasks if logged in and on tasks tab
        if (user && selectedTab === domains.indexOf('tasks')) {
          try {
            const tasksRes = await axios.get('http://localhost:5000/api/tasks', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTasks(tasksRes.data.tasks || []);
            setPoints(tasksRes.data.user?.points || 0);
          } catch (taskError) {
            console.error('Error fetching tasks:', taskError);
            setTasks([]);
          }
        }
        
      } catch (err) {
        console.error('API Error:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedTab]);

  const renderLeaderboard = (domain) => {
    const data = leaderboardData[domain] || [];
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2">Branch</th>
              <th className="px-4 py-2">Year</th>
              <th className="px-4 py-2">Points</th>
              <th className="px-4 py-2">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((user, index) => (
              <tr key={user.email} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-2 text-center">{user.rank}</td>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2 text-center">{user.branch}</td>
                <td className="px-4 py-2 text-center">{user.year}</td>
                <td className="px-4 py-2 text-center">{user.points}</td>
                <td className="px-4 py-2 text-center">{user.attendance}%</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTasks = () => {
    if (!user) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Please log in to view your tasks</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium text-blue-800">Your Progress</h3>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Points:</span>
              <span className="font-bold text-blue-600">{points}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min((points / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div 
                key={task.id || index}
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  disabled
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-not-allowed opacity-70"
                />
                <span className={`ml-3 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.name}
                </span>
                <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {task.points} points
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No tasks available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {domainNames[domains[selectedTab]] || 'Dashboard'}
        </h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}!</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {domains.map((domain, index) => (
            <button
              key={domain}
              onClick={() => setSelectedTab(index)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {domainNames[domain] || domain.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : selectedTab === domains.indexOf('tasks') ? (
          renderTasks()
        ) : (
          renderLeaderboard(domains[selectedTab])
        )}
      </div>
    </div>
  );
};

export default Dashboard;
