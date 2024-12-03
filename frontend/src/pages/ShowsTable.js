import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShowsTableCore from './ShowsTableCore';
import {
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';

function ShowsTable() {
  const [showsData, setShowsData] = useState([]);
  const [bandsData, setBandsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const navigate = useNavigate();

  const safeBandsData = Array.isArray(bandsData) ? bandsData : [];

  useEffect(() => {
    // Fetch shows data
    const fetchShows = async () => {
      try {
        const response = await fetch("http://localhost:3001/shows");
        if (!response.ok) throw new Error("Failed to fetch shows");
        const result = await response.json();
        console.log("Fetched Shows:", result); // Debugging
        setShowsData(result);
      } catch (err) {
        console.error("Error fetching shows:", err);
        setShowsData([]);
      }
    };

    console.log("bandsData: ", bandsData);

    // Fetch bands data
    const fetchBands = async () => {
      try {
        const response = await fetch("http://localhost:3001/tcupbands");
        if (!response.ok) throw new Error("Failed to fetch bands");
        const result = await response.json();
        console.log("Fetched Bands:", result); // Debugging
        setBandsData(result);
      } catch (err) {
        console.error("Error fetching bands:", err);
        setBandsData([]);
      }
    };

    fetchShows();
    fetchBands();
  }, []);

  const filterEvents = () => {
    const filtered = showsData.filter((item) => {
      const matchesSearch = searchTerm
        ? item.venue_name.toLowerCase().includes(searchTerm) ||
          (item.bands && item.bands.some(band => band.name.toLowerCase().includes(searchTerm)))
        : true;

      const matchesVenue = selectedVenue
        ? item.venue_name.toLowerCase() === selectedVenue.toLowerCase()
        : true;

      return matchesSearch && matchesVenue;
    });

    return filtered;
  };


  const processedData = filterEvents().map((show) => ({
    ...show,
    bands: show.bands || [], // Use the `bands` array from the backend
  }));

  return (
    <div>
      <Typography variant="h2" gutterBottom textAlign={'center'}>
        TWIN CITIES SHOW LIST
      </Typography>

      <TextField
        id="outlined-search"
        label="Search by venue or band name"
        type="search"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
      />

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

      <ShowsTableCore
        data={processedData}
        onBandClick={(id) => id && navigate(`/tcupbands/${id}`)} // Only navigate if ID exists
        onVenueClick={(id) => navigate(`/venues/${id}`)}
      />
    </div>
  );
}

export default ShowsTable;