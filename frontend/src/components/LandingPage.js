import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Leaderboard App</h1>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/signup"><button>Signup</button></Link>
    </div>
  );
};

export default LandingPage;
