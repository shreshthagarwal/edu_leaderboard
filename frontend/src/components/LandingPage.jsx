import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Update with the correct path to your logo

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Heading */}
      <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-blue-400 via-green-400 to-pink-500 bg-clip-text text-transparent mb-8">
        EduMinerva Leaderboard
      </h1>

      {/* Logo */}
      <img src={logo} alt="Logo" className="w-60 h-60 mb-8 rounded-full shadow-lg" />

      {/* Login Button */}
      <Link to="/login">
        <button className="w-40 px-4 py-2 mb-4 text-lg font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 rounded-lg hover:from-green-500 hover:to-blue-500 shadow-md">
          Login
        </button>
      </Link>

      {/* Signup Button */}
      <Link to="/signup">
        <button className="w-40 px-4 py-2 text-lg font-semibold text-white bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg hover:from-pink-500 hover:to-purple-500 shadow-md">
          Signup
        </button>
      </Link>
    </div>
  );
};

export default LandingPage;
