import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Search
  const [searchLeaderboard, setSearchLeaderboard] = useState('');
  
  // Selection
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const getAuthHeaders = () => ({ headers: { Authorization: localStorage.getItem('token') } });
  const BASE_URL = 'https://edu-leaderboard-backend.vercel.app';

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaderboard = () => {
    axios.get(`${BASE_URL}/student/leaderboard`, getAuthHeaders())
      .then((res) => { 
        setLeaderboard(res.data); 
        setSelectedStudents(new Set()); 
      })
      .catch((err) => console.error('Error:', err.response?.data || err));
  };

  const handleCheckbox = (id, set, updateSet) => {
    const newSet = new Set(set);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    updateSet(newSet);
  };
  
  const handleSelectAll = (items, set, updateSet) => {
    if (set.size === items.length && items.length > 0) updateSet(new Set());
    else updateSet(new Set(items.map(i => i._id)));
  };

  const executeBulkPoints = async (points) => {
    if (selectedStudents.size === 0) return alert('No students selected');
    if (!points) return;
    try {
      await axios.post(`${BASE_URL}/admin/assign-points-bulk`, { 
        ids: Array.from(selectedStudents), points: parseInt(points) 
      }, getAuthHeaders());
      fetchLeaderboard();
    } catch (err) {
      alert(err.response?.data?.error || 'An error occurred');
    }
  };

  const executeBulkDeleteUsers = async () => {
    if (selectedStudents.size === 0) return alert('No students selected');
    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.size} users?`)) return;
    try {
      await axios.post(`${BASE_URL}/admin/users/bulk-delete`, { 
        ids: Array.from(selectedStudents) 
      }, getAuthHeaders());
      fetchLeaderboard();
    } catch (err) {
      alert(err.response?.data?.error || 'An error occurred');
    }
  };

  const filteredLeaderboard = leaderboard.filter(s => 
    s.name.toLowerCase().includes(searchLeaderboard.toLowerCase())
  );

  // Stats Logic
  const totalUsers = leaderboard.length;
  const winnerPoints = leaderboard.length > 0 ? Math.max(...leaderboard.map(s => s.points)) : 0;
  const averagePoints = leaderboard.length > 0 ? Math.round(leaderboard.reduce((acc, s) => acc + s.points, 0) / leaderboard.length) : 0;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 overflow-hidden">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-4xl font-bold text-blue-400">{totalUsers}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Winner Points</h3>
          <p className="text-4xl font-bold text-green-400">{winnerPoints}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Average Points</h3>
          <p className="text-4xl font-bold text-purple-400">{averagePoints}</p>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="flex-1 flex flex-col bg-gray-900 border border-gray-700 rounded-xl p-6 overflow-hidden shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">User Management</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchLeaderboard} 
              onChange={e => setSearchLeaderboard(e.target.value)} 
              className="px-4 py-2 bg-gray-800 text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
        </div>

        <div className="flex gap-4 mb-4 bg-gray-800 p-3 rounded-lg items-center shadow-inner">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            onChange={() => handleSelectAll(filteredLeaderboard, selectedStudents, setSelectedStudents)} 
            checked={selectedStudents.size === filteredLeaderboard.length && filteredLeaderboard.length > 0} 
          /> 
          <span className="text-sm font-medium">Select All</span>
          <div className="flex-1"></div>
          <button onClick={executeBulkDeleteUsers} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition shadow-md">
            Delete Users
          </button>
          <button onClick={() => {
            const pts = prompt('Enter points to assign to selected:');
            if (pts) executeBulkPoints(pts);
          }} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition shadow-md">
            Bulk Assign Points
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3 pr-2">
          {filteredLeaderboard.map(student => (
            <div key={student._id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center border border-gray-700 hover:border-gray-500 transition shadow">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  checked={selectedStudents.has(student._id)} 
                  onChange={() => handleCheckbox(student._id, selectedStudents, setSelectedStudents)} 
                />
                <p className="font-semibold text-lg">{student.name} {student.role === 'admin' && <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded ml-2 uppercase tracking-wide">Admin</span>}</p>
              </div>
              <p className="text-md font-mono bg-black px-3 py-1 rounded-md text-green-400">{student.points} pts</p>
            </div>
          ))}
          {filteredLeaderboard.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
