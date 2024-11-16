// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Calendar from './pages/Calendar.js';
import Home from './pages/Home.js';
import Table from './pages/Table.js';  // Capitalized to "Table"
import Bands from './pages/Bands.js';  // Capitalized to "Bands"
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/venues" />} />  {/* Redirect from "/" to "/venues" */}
        <Route path="/venues" element={<Home />} />  {/* Venues/Home page */}
        <Route path="/calendar" element={<Calendar />} />  {/* Calendar page */}
        <Route path="/table" element={<Table />} />  {/* Shows table page */}
        <Route path="/bands" element={<Bands />} />  {/* Bands page */}
        <Route path="*" element={<div>Page Not Found</div>} />  {/* Catch-all for invalid routes */}
      </Routes>
    </Router>
  );
}

export default App;