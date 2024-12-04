import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import ShowsTableCore from './ShowsTableCore';

function ShowsTable() {
  const [showsData, setShowsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [showTCUPBandsOnly, setShowTCUPBandsOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch shows data
    const fetchShows = async () => {
      try {
        const response = await fetch('http://localhost:3001/shows');
        if (!response.ok) throw new Error('Failed to fetch shows');
        const result = await response.json();
        setShowsData(result);
      } catch (err) {
        console.error('Error fetching shows:', err);
        setShowsData([]);
      }
    };

    fetchShows();
  }, []);

  // Combined filtering logic
  const filterEvents = () => {
    return showsData.filter((item) => {
      const matchesSearch = searchTerm
        ? item.venue_name.toLowerCase().includes(searchTerm) ||
          (item.bands && item.bands.some((band) => band.name.toLowerCase().includes(searchTerm)))
        : true;

      const matchesVenue = selectedVenue
        ? item.venue_name.toLowerCase() === selectedVenue.toLowerCase()
        : true;

      const matchesTCUP = showTCUPBandsOnly
        ? item.bands && item.bands.some((band) => band.id)
        : true;

      return matchesSearch && matchesVenue && matchesTCUP;
    });
  };

  const filteredData = filterEvents();

  return (
    <Box sx={{ paddingBottom: '150px', overflowY: 'auto' }}>
      <Typography variant="h2" gutterBottom textAlign="center">
        TWIN CITIES SHOW LIST
      </Typography>

      {/* Show TCUP Bands Only Filter */}
      <FormControlLabel
        control={
          <Checkbox
            checked={showTCUPBandsOnly}
            onChange={(e) => setShowTCUPBandsOnly(e.target.checked)}
          />
        }
        label="Show TCUP bands only"
        style={{ marginBottom: '16px' }}
      />

      {/* Search Field */}
      <TextField
        id="outlined-search"
        label="Search by venue or band name"
        type="search"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
      />

      {/* Venue Selector */}
      <Select
        value={selectedVenue}
        onChange={(e) => setSelectedVenue(e.target.value)}
        displayEmpty
        fullWidth
        style={{ marginBottom: '20px' }}
      >
        <MenuItem value="">All Venues</MenuItem>
        {[...new Set(showsData.map((item) => item.venue_name))].map((venue, index) => (
          <MenuItem key={index} value={venue}>
            {venue}
          </MenuItem>
        ))}
      </Select>

      {/* Table Core Component */}
      <ShowsTableCore
        data={filteredData}
        onBandClick={(id) => id && navigate(`/tcupbands/${id}`)} // Navigate to band page if ID exists
        onVenueClick={(id) => navigate(`/venues/${id}`)} // Navigate to venue page
      />
    </Box>
  );
}

export default ShowsTable;