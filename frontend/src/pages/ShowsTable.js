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
    fetch('http://localhost:3001/tcup?table=shows')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching show data:", error));
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