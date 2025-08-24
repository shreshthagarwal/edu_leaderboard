import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiAward, FiUser, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import logo from '../assets/logo.png';

const domainNames = {
  webd: { full: 'Web Development', short: 'Web Dev' },
  aiml: { full: 'AI/ML', short: 'AI/ML' },
  dsa: { full: 'Data Structures & Algorithms', short: 'DSA' },
  tasks: { full: 'My Tasks', short: 'Tasks' }
};

const domainFullNames = {
  webd: 'Web Development',
  aiml: 'Artificial Intelligence & Machine Learning',
  dsa: 'Data Structures & Algorithms'
};

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [points, setPoints] = useState(0);
  const { user, logout } = useAuth();
  const domains = ['webd', 'aiml', 'dsa', 'tasks'];
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch leaderboard data
      const leaderboardPromises = domains
        .filter(domain => domain !== 'tasks')
        .map(domain => 
          axios.get(`${process.env.REACT_APP_API_URL || 'https://edu-leaderboard-backend.vercel.app'}/api/leaderboard/${domain}`)
            .then(res => res.data)
            .catch(error => {
              console.error(`Error fetching ${domain} leaderboard:`, error);
              return { success: false, error: `Failed to load ${domain} leaderboard` };
            })
        );
      
      // Fetch tasks if user is logged in
      let tasksData = [];
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const tasksRes = await axios.get(`${process.env.REACT_APP_API_URL || 'https://edu-leaderboard-backend.vercel.app'}/api/tasks`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (tasksRes.data.success && Array.isArray(tasksRes.data.tasks)) {
            tasksData = tasksRes.data.tasks.map((task, index) => ({
              id: task.id || `task-${index}`,
              name: task.name || 'Unnamed Task',
              completed: Boolean(task.completed),
              points: Number(task.points) || 0
            }));
            
            const userPoints = tasksData
              .filter(t => t.completed)
              .reduce((sum, task) => sum + task.points, 0);
            
            setPoints(userPoints);
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          setError('Failed to load tasks. Please try again.');
          tasksData = [];
        }
      }
      
      const leaderboardResults = await Promise.all(leaderboardPromises);
      const leaderboardMap = {};
      
      domains.filter(domain => domain !== 'tasks').forEach((domain, index) => {
        if (leaderboardResults[index]?.success) {
          leaderboardMap[domain] = leaderboardResults[index].data || [];
        } else {
          setError(prev => 
            `${prev ? prev + ' ' : ''}${leaderboardResults[index]?.error || `Failed to load ${domain} leaderboard`}`
          );
          leaderboardMap[domain] = [];
        }
      });
      
      setLeaderboardData(leaderboardMap);
      setTasks(tasksData);
      
    } catch (err) {
      console.error('API Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderError = () => (
    <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 mb-4 flex items-start">
      <FiAlertCircle className="flex-shrink-0 h-5 w-5 text-red-400 mt-0.5 mr-2" />
      <div className="flex-1">
        <p className="text-sm text-red-200">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 inline-flex items-center text-sm text-red-300 hover:text-white transition-colors"
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <FiRefreshCw className="animate-spin mr-1.5 h-4 w-4" />
              Refreshing...
            </>
          ) : (
            'Try again'
          )}
        </button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400">Loading data...</p>
    </div>
  );

  const renderLeaderboard = (domain) => {
    const data = leaderboardData[domain] || [];
    const currentUserRank = data.findIndex(u => u.email === user?.email) + 1;
    const isUsersDomain = user?.domain === domain;
    
    return (
      <div className="space-y-3">
        <div className="bg-gray-800/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl border border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              {isUsersDomain ? 'Your Rank' : `${domainNames[domain].full} Leaderboard`}
            </h3>
            {isUsersDomain ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold">
                  {currentUserRank > 0 ? `#${currentUserRank}` : 'Unranked'}
                </span>
                <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full inline-flex items-center">
                <span className="hidden sm:inline">Not Your Domain</span>
                <span className="sm:hidden">Not Your Domain</span>
              </div>
            )}
          </div>
          
          {data.length > 0 ? (
            <div className="space-y-2">
              {data.slice(0, 5).map((leaderboardUser, index) => {
                const isCurrentUser = leaderboardUser.email === user?.email;
                return (
                  <div 
                    key={`${domain}-${leaderboardUser.email}-${index}`}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-all ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-green-900/30 to-green-800/30 border-l-4 border-green-500' 
                        : 'bg-gray-800/30 hover:bg-gray-800/50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-amber-700/20 text-amber-500' : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs">
                          {leaderboardUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm sm:text-base font-medium truncate ml-2">
                          {leaderboardUser.name || 'Unknown User'}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap ml-2">
                        {leaderboardUser.points || 0} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p>No data available for this leaderboard</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalPoints = tasks.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0);
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-3 sm:p-4 rounded-xl border border-blue-800/30">
            <p className="text-xs sm:text-sm text-blue-300 mb-1">Total Tasks</p>
            <p className="text-xl sm:text-2xl font-bold">{tasks.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-3 sm:p-4 rounded-xl border border-green-800/30">
            <p className="text-xs sm:text-sm text-green-300 mb-1">Completed</p>
            <div className="flex items-baseline space-x-1 sm:space-x-2">
              <p className="text-xl sm:text-2xl font-bold">{completedTasks}</p>
              <span className="text-xs text-gray-400">
                ({tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-3 sm:p-4 rounded-xl border border-purple-800/30">
            <p className="text-xs sm:text-sm text-purple-300 mb-1">Total Points</p>
            <p className="text-xl sm:text-2xl font-bold">{totalPoints}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div className="bg-gray-800/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
            />
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-2 sm:space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-colors ${
                  task.completed 
                    ? 'bg-gray-800/30 border-green-900/30' 
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div 
                    className={`flex-shrink-0 p-1 sm:p-1.5 rounded-full ${
                      task.completed 
                        ? 'text-green-500 bg-green-500/10' 
                        : 'text-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <FiCheckCircle size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm sm:text-base font-medium truncate ${
                      task.completed ? 'text-gray-400 line-through' : 'text-white'
                    }`}>
                      {task.name}
                    </p>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.completed 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {task.points} pts
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FiCheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-300">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {loading ? 'Loading tasks...' : 'You don\'t have any tasks assigned yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header - Enhanced for both mobile and desktop */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src={logo} 
                alt="EduLeaderboard" 
                className="h-9 sm:h-10 md:h-11 w-auto"
              />
            </div>
            
            {/* User Info - Visible on all screens */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-400">
                  Welcome,{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent font-medium">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  <span className="sm:hidden">Domain: </span>
                  <span className="text-blue-300 font-medium">
                    {domainFullNames[user?.domain] || 'No domain'}
                  </span>
                </p>
              </div>
              <button
                onClick={logout}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs sm:text-sm flex items-center space-x-1 transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-3 pb-20 sm:pb-24 md:pb-6">
        {/* Error Message */}
        {error && renderError()}

        {/* Desktop Tabs */}
        <div className="hidden md:flex justify-center mb-4 sm:mb-6 border-b border-gray-800 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {domains.map((domain, index) => (
              <button
                key={domain}
                onClick={() => setSelectedTab(index)}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap ${
                  selectedTab === index
                    ? 'text-white bg-gray-800 border-t border-l border-r border-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {domainNames[domain].full}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View - Show only current tab content */}
        <div className="md:hidden mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl font-medium">
            {selectedTab === domains.length - 1 
              ? 'Your Tasks' 
              : `${domainNames[domains[selectedTab]].full} Leaderboard`}
          </h1>
          <div className="w-14 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-1 mb-3"></div>
        </div>

        {/* Content */}
        {loading && !refreshing ? (
          renderLoading()
        ) : selectedTab === domains.length - 1 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/50">
            {renderTasks()}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/50">
            {renderLeaderboard(domains[selectedTab])}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-20">
        <div className="flex justify-around items-center h-14">
          {domains.map((domain, index) => (
            <button
              key={domain}
              onClick={() => setSelectedTab(index)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                selectedTab === index ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {domain === 'tasks' ? (
                <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
              ) : (
                <FiAward className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
              )}
              <span className="text-[10px] xs:text-xs">
                {domainNames[domain].short}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
