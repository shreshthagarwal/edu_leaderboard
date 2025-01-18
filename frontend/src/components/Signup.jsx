import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Update with the correct path to your logo

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error messages
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://edu-leaderboard-backend.vercel.app/auth/signup', { name, email, password });
      navigate('/login'); // Navigate to login on success
    } catch (err) {
      setError(err.response?.data?.error || 'Unexpected error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 underline flex items-center"
      >
        <span className="mr-1">&#8592;</span> Back
      </Link>

      {/* Heading */}
      <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-pink-500 bg-clip-text text-transparent mb-8">
        Signup
      </h2>

      {/* Logo */}
      <img src={logo} alt="Logo" className="w-40 h-40 mb-8 rounded-full shadow-lg" />

      {/* Form */}
      <form onSubmit={handleSignup} className="w-80 flex flex-col gap-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-lg font-semibold text-white bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg hover:from-pink-500 hover:to-purple-500 shadow-md"
        >
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
