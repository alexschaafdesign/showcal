// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Calendar from './pages/Calendar.js';  // Adjust the path if necessary
import Home from './pages/Home.js';  // Example for a homepage, adjust as needed
import './styles/App.css';  // Global styles for the app


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />  {/* Default homepage */}
        <Route path="/calendar" element={<Calendar />} />  {/* Calendar page */}
      </Routes>
    </Router>
  );
}

export default App;