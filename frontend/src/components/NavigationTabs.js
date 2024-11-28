import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the active tab based on the current route
  const getActiveTab = () => {
    if (location.pathname.startsWith('/shows')) return 0;
    if (location.pathname.startsWith('/venues')) return 1;
    if (location.pathname.startsWith('/bands')) return 2;
    if (location.pathname.startsWith('/tcupbands')) return 3;
    return false; // No tab selected
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) navigate('/shows'); // Navigate to Shows table
    if (newValue === 1) navigate('/venues'); // Navigate to Venues table
    if (newValue === 2) navigate('/bands'); // Navigate to Bands table
    if (newValue === 3) navigate('/tcupbands'); // Navigate to TCUP Bands table

  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs value={getActiveTab()} onChange={handleTabChange} centered>
        <Tab label="Shows" />
        <Tab label="Venues" />
        <Tab label="Bands" />
        <Tab label="TCUP Bands" />
      </Tabs>
    </Box>
  );
};

export default NavigationTabs;