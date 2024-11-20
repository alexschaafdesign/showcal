// src/App.js

import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Calendar from './pages/Calendar.js';
import Home from './pages/Home.js';
import ShowsTable from './pages/ShowsTable.js';  // Capitalized to "Table"
import BandsTable from './pages/BandsTable.js';  // Capitalized to "Bands"
import BandProfile from './pages/BandProfile.js';  // Import the new BandProfile component
import './styles/App.css';
import VenuesTable from './pages/VenuesTable.js';
import VenueProfile from './pages/VenueProfile.js';
import BandForm from './pages/BandForm.js';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/venues" />} /> {/* Redirect from "/" to "/venues" */}
      <Route path="/venues" element={<Home />} /> {/* Venues/Home page */}
      <Route path="/calendar" element={<Calendar />} /> {/* Calendar page */}
      <Route path="/showstable" element={<ShowsTable />} /> {/* Shows table page */}
      <Route path="/bandstable" element={<BandsTable />} /> {/* Bands page */}
      <Route path="/venuestable" element={<VenuesTable />} /> {/* Venues page */}
      <Route path="/bands/:band" element={<BandProfile />} /> {/* Dynamic band profile page */}
      <Route path="/venues/:venueName" element={<VenueProfile />} /> {/* Dynamic route */}
      <Route path="/add-band" element={<BandForm />} />
      <Route path="*" element={<div>Page Not Found</div>} /> {/* Catch-all for invalid routes */}
    </Routes>
  );
}

export default App;