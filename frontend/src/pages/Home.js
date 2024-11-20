// src/pages/Home.js

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>Click below to view the show table:</p>
      <Link to="/showstable">Go to Shows Table</Link>
      <p>Click below to view the Bands table:</p>
      <Link to="/bandstable">Go to bands table</Link>
      <p>Click below to view the Venues table:</p>
      <Link to="/venuestable">Go to venues table</Link>
    </div>
  );
};

export default Home;