import React from 'react';
import ReactDOM from "react-dom";
import { Route, Routes, Navigate } from 'react-router-dom';
import Calendar from './pages/Calendar.js';
import Home from './pages/Home.js';
import ShowsTable from './pages/ShowsTable.js';
import BandsTable from './pages/BandsTable.js';
import BandProfile from './pages/BandProfile.js';
import './styles/App.css';
import VenuesTable from './pages/VenuesTable.js';
import VenueProfile from './pages/VenueProfile.js';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TCUPBandForm from './pages/TCUPBandForm.js';
import TCUPBandsTable from './pages/TCUPBandsTable.js';
import TCUPBandProfile from './pages/TCUPBandProfile.js';


function App() {
  return (
    <Box sx={{
      padding: {
        xs: 2,  // padding of 16px for extra small screens
        sm: 3,  // padding of 24px for small screens
        md: 4,  // padding of 32px for medium screens
      },
      margin: 2,
    }}> 
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home page */}
        <Route path="/shows" element={<ShowsTable />} /> {/* Shows table page */}
        <Route path="/bands" element={<BandsTable />} /> {/* Bands page */}
        <Route path="/tcupbands" element={<TCUPBandsTable />} /> {/* Bands page */}
        <Route path="/venues" element={<VenuesTable />} /> {/* Venues page */}
        <Route path="/bands/:id/view" element={<BandProfile />} /> {/* View dynamic band profile page */}
        <Route path="/tcupbands/:id/view" element={<TCUPBandProfile />} /> {/* View dynamic band profile page */}
        <Route path="/tcupbands/:id/edit" element={<TCUPBandForm />} /> {/* Edit band profile page */}
        <Route path="/venues/:id" element={<VenueProfile />} /> {/* Dynamic route */}
        <Route path="/tcupbands/add" element={<TCUPBandForm />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="*" element={<div>Page Not Found</div>} /> {/* Catch-all for invalid routes */}
      </Routes>
    </Box>
  );
}

export default App;