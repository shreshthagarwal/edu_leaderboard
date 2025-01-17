import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [taskDescription, setTaskDescription] = useState('');

  // Fetch leaderboard data
  useEffect(() => {
    axios
      .get('http://localhost:5000/student/leaderboard', {
        headers: { Authorization: localStorage.getItem('token') },
      })
      .then((res) => setLeaderboard(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Handle task submission
  const handleRequestTask = () => {
    if (!taskDescription.trim()) {
      alert('Please enter a task description');
      return;
    }

    axios
      .post(
        'http://localhost:5000/student/request',
        { taskDescription },
        { headers: { Authorization: localStorage.getItem('token') } }
      )
      .then((res) => {
        alert(res.data.message);
        setTaskDescription('');
      })
      .catch((err) => alert(err.response?.data?.error || 'An error occurred'));
  };

  return (
    <div>
      <h1>Student Dashboard</h1>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((student, index) => (
          <li key={index}>
            {student.name}: {student.points} points
          </li>
        ))}
      </ul>
      <h2>Request Task Points</h2>
      <input
        type="text"
        placeholder="Enter task description"
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
      />
      <button onClick={handleRequestTask}>Request Points</button>
    </div>
  );
};

export default Dashboard;
