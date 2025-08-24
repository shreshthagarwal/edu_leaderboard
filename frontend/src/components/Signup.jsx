import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiLoader, FiArrowLeft } from 'react-icons/fi';
import logo from '../assets/logo.png';
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
  const [loading, setLoading] = useState(false);
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
    setError('');
    setLoading(true);
    
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, formData);
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in.' 
        } 
      });
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const fieldErrors = err.response.data.errors;
        const fieldMessages = fieldErrors.map(error => 
          `${error.field ? `${error.field}: ` : ''}${error.message}`
        );
        setError(fieldMessages.join('\n'));
      } 
      // Handle duplicate email
      else if (err.response?.data?.message === 'Email already in use') {
        setError('This email is already registered. Please use a different email or log in.');
      }
      // Handle server errors
      else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      }
      // Handle network errors
      else if (!err.response) {
        setError('Network error. Please check your connection and try again.');
      }
      // Fallback error
      else {
        setError(err.response?.data?.message || 'An error occurred during signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-1" /> Back to Home
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
          <div className="p-8">
            <div className="text-center mb-8">
              <img 
                src={logo} 
                alt="Logo" 
                className="mx-auto h-20 w-auto mb-4" 
              />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-pink-500 bg-clip-text text-transparent">
                Create an account
              </h2>
              <p className="mt-2 text-gray-400">Join our community today</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Full Name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., CSE, IT"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">
                    Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={loading}
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
                <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-1">
                  Domain
                </label>
                <select
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                >
                  <option value="webd">Web Development</option>
                  <option value="aiml">AI/ML</option>
                  <option value="dsa">DSA</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium transition-all ${
                    loading 
                      ? 'bg-blue-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-blue-500/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>

          <div className="px-8 py-4 bg-gray-800/50 text-center border-t border-gray-700/50">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
