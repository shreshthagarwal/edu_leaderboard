import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Update with the correct path to your logo
import { API_BASE_URL } from '../config';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    year: '',
    domain: 'webd' // Default domain
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, formData);
      navigate('/login'); // Navigate to login on success
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred during signup');
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
      <form onSubmit={handleSubmit} className="w-80 flex flex-col gap-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={formData.name}
          onChange={handleChange}
          name="name"
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={formData.email}
          onChange={handleChange}
          name="email"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={formData.password}
          onChange={handleChange}
          name="password"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Branch"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={formData.branch}
              onChange={handleChange}
              name="branch"
              required
            />
          </div>

          <div>
            <select
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={formData.year}
              onChange={handleChange}
              name="year"
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        <div>
          <select
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={formData.domain}
            onChange={handleChange}
            name="domain"
            required
          >
            <option value="webd">Web Development</option>
            <option value="aiml">AI/ML</option>
            <option value="dsa">Data Structures & Algorithms</option>
          </select>
        </div>

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
