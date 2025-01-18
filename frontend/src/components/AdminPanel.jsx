import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({}); // To manage popup details

  // Fetch pending requests
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    axios
      .get('https://edu-leaderboard-backend.vercel.app//admin/requests', {
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
      .post(`https://edu-leaderboard-backend.vercel.app//admin/requests/${id}`, body, {
        headers: { Authorization: localStorage.getItem('token') },
      })
      .then(() => {
        setIsPopupOpen(false);
        fetchRequests(); // Refresh the requests list
      })
      .catch((err) => setPopupContent({ error: err.response?.data?.error || 'An error occurred' }));
  };

  const openPopup = (request) => {
    setPopupContent(request);
    setIsPopupOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Heading */}
      <div className="flex items-center justify-center py-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
          Admin Panel
        </h1>
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto p-4">
        {requests.map((req) => (
          <div
            key={req._id}
            className="p-4 mb-4 bg-gray-800 rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-semibold">{req.studentId.name}</p>
              <p className="text-sm text-gray-400">{req.studentId.email}</p>
              <p className="mt-2">{req.taskDescription}</p>
            </div>
            <button
              onClick={() => openPopup(req)}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 rounded-lg hover:from-green-500 hover:to-blue-500 shadow-md"
            >
              Review
            </button>
          </div>
        ))}
      </div>

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Review Request</h2>
            <p>
              <strong>Student:</strong> {popupContent.studentId?.name} ({popupContent.studentId?.email})
            </p>
            <p className="mt-2">
              <strong>Task:</strong> {popupContent.taskDescription}
            </p>

            {popupContent.error && (
              <p className="mt-4 text-sm text-red-500">{popupContent.error}</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => handleUpdateRequest(popupContent._id, 'declined')}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  const points = prompt('Enter points to allot:');
                  if (points) handleUpdateRequest(popupContent._id, 'accepted', parseInt(points));
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 rounded-lg hover:from-green-500 hover:to-blue-500 shadow-md"
              >
                Accept
              </button>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
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
