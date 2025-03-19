import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({});
  const [assigningPoints, setAssigningPoints] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchLeaderboard();
  }, []);

  const fetchRequests = () => {
    axios
      .get('https://edu-leaderboard-backend.vercel.app/admin/requests', {
        headers: { Authorization: localStorage.getItem('token') },
      })
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  };

  const fetchLeaderboard = () => {
    axios.get('https://edu-leaderboard-backend.vercel.app/student/leaderboard', {
      headers: { Authorization: localStorage.getItem('token') },
    })
    .then((res) => setLeaderboard(res.data)) // Update the leaderboard state
    .catch((err) => console.error('Error:', err.response?.data || err));
  };

  const handleUpdateRequest = (id, status, customPoints = null) => {
    const body = { status };
    if (status === 'accepted' && customPoints !== null) {
      body.customPoints = customPoints;
    }

    axios
      .post(`https://edu-leaderboard-backend.vercel.app/admin/requests/${id}`, body, {
        headers: { Authorization: localStorage.getItem('token') },
      })
      .then(() => {
        setIsPopupOpen(false);
        fetchRequests();
      })
      .catch((err) => setPopupContent({ error: err.response?.data?.error || 'An error occurred' }));
  };

  const openPopup = (data, isAssigning = false) => {
    setPopupContent(data);
    setAssigningPoints(isAssigning);
    setIsPopupOpen(true);
  };

  const assignPoints = (id) => {
    const points = prompt('Enter points to assign:');
    if (points) {
      axios
        .post(`https://edu-leaderboard-backend.vercel.app/admin/assign-points`, { id, points: parseInt(points) }, {
          headers: { Authorization: localStorage.getItem('token') },
        })
        .then(() => {
          setIsPopupOpen(false);
          fetchLeaderboard();
        })
        .catch((err) => setPopupContent({ error: err.response?.data?.error || 'An error occurred' }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
        Admin Panel
      </h1>

      {/* Requests Section */}
      <h2 className="text-xl font-semibold mb-2">Requests</h2>
      <div className="overflow-y-auto mb-6 h-[50vh]"> {/* 50% of the viewport height */}
  {requests.map((req) => (
    <div key={req._id} className="p-4 mb-4 bg-gray-800 rounded-lg shadow-md flex justify-between items-center">
      <div>
        <p className="text-lg font-semibold">{req.studentId.name}</p>
        <p className="text-sm text-gray-400">{req.studentId.email}</p>
        <p className="mt-2">{req.taskDescription}</p>
      </div>
      <button onClick={() => openPopup(req)} className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600">
        Review
      </button>
    </div>
  ))}
</div>

      {/* Assign Points Section */}
      <h2 className="text-xl font-semibold mb-2">Assign Points</h2>
      <div className="overflow-y-auto mb-6 h-[50vh]"">
        {leaderboard.map((student) => (
          <div key={student._id} className="p-4 mb-2 bg-gray-800 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-700" onClick={() => openPopup(student, true)}>
            <p className="text-lg font-semibold">{student.name}</p>
            <p className="text-sm text-gray-400">{student.points} points</p>
          </div>
        ))}
      </div>

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{assigningPoints ? 'Assign Points' : 'Review Request'}</h2>
            <p><strong>Student:</strong> {popupContent.name || popupContent.studentId?.name}</p>
            <p className="mt-2">{!assigningPoints && <><strong>Task:</strong> {popupContent.taskDescription}</>}</p>

            {popupContent.error && <p className="mt-4 text-sm text-red-500">{popupContent.error}</p>}

            <div className="flex justify-end gap-4 mt-6">
              {assigningPoints ? (
                <button onClick={() => assignPoints(popupContent._id)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                  Assign Points
                </button>
              ) : (
                <>
                  <button onClick={() => handleUpdateRequest(popupContent._id, 'declined')} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">
                    Decline
                  </button>
                  <button onClick={() => {
                    const points = prompt('Enter points to allot:');
                    if (points) handleUpdateRequest(popupContent._id, 'accepted', parseInt(points));
                  }} className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600">
                    Accept
                  </button>
                </>
              )}
              <button onClick={() => setIsPopupOpen(false)} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
