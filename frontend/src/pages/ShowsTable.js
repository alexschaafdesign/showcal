import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@mui/material';
import ShowsTableCore from './ShowsTableCore';

function ShowsTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch("http://localhost:3001/tcup?table=shows");
        if (!response.ok) {
          throw new Error("Failed to fetch shows");
        }
        const result = await response.json();
        console.log("Fetched Shows:", result); // Debugging
        setData(result); // Ensure result is an array
      } catch (err) {
        console.error("Error fetching shows:", err);
        setData([]); // Default to an empty array on error
      }
    };
    fetchShows();
  }, []);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const filterEvents = () => {
    const filtered = data.filter((item) => {
      const matchesSearch = searchTerm
        ? item.venue_name.toLowerCase().includes(searchTerm) ||
          item.bands.toLowerCase().includes(searchTerm)
        : true;
      const matchesVenue = selectedVenue
        ? item.venue_name.toLowerCase() === selectedVenue.toLowerCase()
        : true;

      return matchesSearch && matchesVenue;
    });

    return filtered;
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Shows" />
          <Tab label="Venues" onClick={() => navigate('/venues')} />
          <Tab label="Bands" onClick={() => navigate('/bands')} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          <Typography variant="h1" gutterBottom textAlign={'center'}>
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
            {[...new Set(data.map((item) => item.venue_name))].map((venue, index) => (
              <MenuItem key={index} value={venue}>
                {venue}
              </MenuItem>
            ))}
          </Select>

          <ShowsTableCore
            data={filterEvents()}
            onBandClick={(id) => navigate(`/bands/${id}`)}
            onVenueClick={(id) => navigate(`/venues/${id}`)}
          />
        </>
      )}
    </div>
  );
}

export default ShowsTable;