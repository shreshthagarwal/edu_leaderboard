import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png'; // Update with the correct path to your logo

const Dashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userName, setUserName] = useState(''); // State for user name

  // Fetch leaderboard data and user name
  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaderboardRes = await axios.get('https://edu-leaderboard-backend.vercel.app/student/leaderboard', {
          headers: { Authorization: localStorage.getItem('token') },
        });
        setLeaderboard(leaderboardRes.data);

        const userRes = await axios.get('https://edu-leaderboard-backend.vercel.app/auth/me', {
          headers: { Authorization: localStorage.getItem('token') },
        });
        setUserName(userRes.data.name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Handle task submission
  const handleRequestTask = () => {
    if (!taskDescription.trim()) {
      alert('Please enter a task description');
      return;
    }

    axios
      .post(
        'https://edu-leaderboard-backend.vercel.app/student/request',
        { taskDescription },
        { headers: { Authorization: localStorage.getItem('token') } }
      )
      .then((res) => {
        alert(res.data.message);
        setTaskDescription('');
        setIsPopupOpen(false);
      })
      .catch((err) => alert(err.response?.data?.error || 'An error occurred'));
  };

  const getRankStyle = (rank, studentName) => {
    if (rank === 1) return 'border-4 border-yellow-500'; // Gold
    if (rank === 2) return 'border-4 border-gray-400'; // Silver
    if (rank === 3) return 'border-4 border-amber-700'; // Bronze
    if (studentName === userName) return 'border-2 border-green-400'; // Highlight current user
    return ''; // No special border
  };

  const getRankSymbol = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank === 4 || rank === 5) return '⭐';
    return rank; // Display rank number for others
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 shadow-md">
        <img src={logo} alt="Logo" className="w-10 h-10" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 rounded-lg hover:from-green-500 hover:to-blue-500 shadow-md"
        >
          Request Points
        </button>
      </div>

      {/* Welcome Section */}
      <h2 className="text-center text-2xl font-semibold text-white py-4">
  Welcome, {userName || 'Guest'}
</h2>


      {/* Leaderboard Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {leaderboard.map((student, index) => (
            <li
              key={index}
              className={`flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md ${getRankStyle(index + 1, student.name)}`}
            >
              <span className="w-8 text-center">
                {getRankSymbol(index + 1)}
              </span>
              <span>{student.name}</span>
              <span>{student.points} points</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Popup for Task Description */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Request Points</h2>
            <textarea
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              rows="4"
            ></textarea>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestTask}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 rounded-lg hover:from-green-500 hover:to-blue-500 shadow-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
