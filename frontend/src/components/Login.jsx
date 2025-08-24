import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import { FiLoader, FiArrowLeft } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email or Password');
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
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-400">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    {error.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
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
                      Signing in...
                    </>
                  ) : 'Sign in'}
                </button>
              </div>
            </form>
          </div>

          <div className="px-8 py-4 bg-gray-800/50 text-center border-t border-gray-700/50">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
