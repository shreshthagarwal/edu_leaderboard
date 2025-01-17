import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);

  // Fetch pending requests
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    axios
      .get('http://localhost:5000/admin/requests', {
        headers: { Authorization: localStorage.getItem('token') },
      })
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  };

  // Handle accept or decline
  const handleUpdateRequest = (id, status, customPoints = null) => {
    const body = { status };
    if (status === 'accepted' && customPoints !== null) {
      body.customPoints = customPoints;
    }

    axios
      .post(`http://localhost:5000/admin/requests/${id}`, body, {
        headers: { Authorization: localStorage.getItem('token') },
      })
      .then((res) => {
        alert(res.data.message);
        fetchRequests(); // Refresh the requests list
      })
      .catch((err) => alert(err.response?.data?.error || 'An error occurred'));
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      {requests.map((req) => (
        <div key={req._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <p>
            <strong>Student:</strong> {req.studentId.name} ({req.studentId.email})
          </p>
          <p>
            <strong>Task:</strong> {req.taskDescription}
          </p>
          <button onClick={() => handleUpdateRequest(req._id, 'declined')}>Decline</button>
          <button
            onClick={() => {
              const points = prompt('Enter points to allot:');
              if (points) handleUpdateRequest(req._id, 'accepted', parseInt(points));
            }}
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
