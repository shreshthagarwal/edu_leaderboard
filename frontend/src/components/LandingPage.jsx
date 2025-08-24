import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import logo from '../assets/logo.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logo} 
            alt="EduMinerva Logo" 
            className="h-32 w-auto animate-float"
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-green-400 to-pink-500 bg-clip-text text-transparent">
          EduTech Learning Circle
        </h1>
        
        {/* Subheading */}
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Track your progress, compete with peers, and climb the leaderboard in your chosen domain.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
          <Link 
            to="/signup" 
            className="group relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center justify-center">
              Get Started
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>
          
          <Link 
            to="/login" 
            className="px-8 py-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white font-medium hover:bg-gray-700/50 transition-colors duration-300 transform hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-gray-800/20"
            style={{
              width: Math.random() * 300 + 100 + 'px',
              height: Math.random() * 300 + 100 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              filter: 'blur(40px)',
              transform: `scale(${Math.random() * 2 + 1})`,
              opacity: 0.2,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
