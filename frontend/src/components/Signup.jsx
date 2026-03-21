import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Update with the correct path to your logo

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState(''); // State for error messages
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const fullName = `${name} ${branch}-${specialization}`;
    try {
      const res = await axios.post(`https://edu-leaderboard-backend.vercel.app/auth/signup`, { name: fullName, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      res.data.role === 'admin' ? navigate('/admin') : navigate('/dashboard');
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
          autoComplete="name"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        >
          <option value="" disabled hidden>Select Branch</option>
          <option value="CSE-1">CSE-1</option>
          <option value="CSE-2">CSE-2</option>
          <option value="IT-1">IT-1</option>
          <option value="IT-2">IT-2</option>
          <option value="ECE-1">ECE-1</option>
          <option value="ECE-2">ECE-2</option>
          <option value="ECE-3">ECE-3</option>
          <option value="EEE">EEE</option>
          <option value="ICE">ICE</option>
        </select>
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        >
          <option value="" disabled hidden>Select Specialization</option>
          <option value="AI/ML">AI/ML</option>
          <option value="Data Science">Data Science</option>
          <option value="CSE">CSE</option>
          <option value="Core">Core</option>
        </select>
        <input
          type="email"
          placeholder="Email"
          autoComplete="username"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
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
