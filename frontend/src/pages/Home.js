// src/pages/Home.js

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>Click below to view the calendar:</p>
      <Link to="/calendar">Go to Calendar</Link>
      <p>Click below to view the bands table:</p>
      <Link to="/bands">Go to Bands</Link>
    </div>
  );
};

export default Home;