import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
} from '@mui/material';

function ShowsTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [activeTab, setActiveTab] = useState(0); // State for active tab
  const navigate = useNavigate();

  // Fetch show data from the backend
  useEffect(() => {
    fetch('http://localhost:3001/tcup?table=shows')
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched show data:", data);
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setData([]);
        }
      })
      .catch((error) => console.error("Error fetching show data:", error));
  }, []);

  // Filter to show only future events
  const filterFutureEvents = (data) => {
    const today = new Date();
    return data.filter((item) => item.start && new Date(item.start) >= today);
  };

  // Filter events by search term and selected venue
  const filterEvents = (data) => {
    let filteredData = filterFutureEvents(data);

    if (selectedVenue) {
      filteredData = filteredData.filter((item) =>
        item.venue_name.toLowerCase().includes(selectedVenue.toLowerCase())
      );
    }

    if (searchTerm) {
      filteredData = filteredData.filter(
        (item) =>
          item.venue_name.toLowerCase().includes(searchTerm) ||
          item.bands.toLowerCase().includes(searchTerm)
      );
    }

    return filteredData;
  };

  // Group events by date
  const groupByDate = (data) => {
    const filteredData = filterEvents(data);
    const grouped = {};
    filteredData.forEach((item) => {
      if (item.start) {
        const showDate = new Date(item.start).toLocaleDateString();
        if (!grouped[showDate]) {
          grouped[showDate] = [];
        }
        grouped[showDate].push(item);
      }
    });
    return grouped;
  };

  const groupedData = groupByDate(data);
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  const handleBandClick = (bandId) => {
    console.log('Navigating to band:', bandId);
    if (!bandId) {
      console.error('Invalid band ID:', bandId);
      return;
    }
    navigate(`/bands/${encodeURIComponent(bandId)}/view`);
  };

  const handleVenueClick = (venueId) => {
    navigate(`/venues/${encodeURIComponent(venueId)}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      {/* Tabs */}
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

          <Typography variant="h4" gutterBottom textAlign={'center'}>
            brought to you by <a href="https://www.tcupboard.org">TCUP</a>
          </Typography>

          {/* Search */}
          <TextField
            id="outlined-search"
            label="Search by venue or band name"
            type="search"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />

          {/* Venue Filter */}
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

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Flyer</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Bands</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>Event Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No events found for the selected criteria.</TableCell>
                  </TableRow>
                ) : (
                  sortedDates.map((date) => (
                    <React.Fragment key={date}>
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          style={{
                            textAlign: 'center',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            background: '#d8d8d8',
                          }}
                        >
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                      {groupedData[date]
                        .sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort events by start time
                        .map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {item.flyer_image ? (
                                <img
                                  src={item.flyer_image}
                                  alt="Flyer"
                                  style={{
                                    maxWidth: '150px',
                                    maxHeight: '150px',
                                    borderRadius: '10px',
                                  }}
                                />
                              ) : (
                                'No Flyer'
                              )}
                            </TableCell>
                            <TableCell
                              style={{
                                textTransform: 'uppercase',
                                fontWeight: '400',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleVenueClick(item.venue_id)} // Pass venue_id
                            >
                              {item.venue_name || "Unknown Venue"}
                            </TableCell>
                            <TableCell>
                              {item.band_list.map((band, index) => (
                                <div key={index}>
                                  <Button
                                    onClick={() => handleBandClick(band.id)} // Use band.id here
                                    style={{ textTransform: 'none', fontSize: '1rem' }}
                                    variant="text"
                                  >
                                    {band.name}
                                  </Button>
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>
                              {new Date(item.start).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </TableCell>
                            <TableCell>
                              {item.event_link ? (
                                <a href={item.event_link} target="_blank" rel="noopener noreferrer">
                                  Event Link
                                </a>
                              ) : (
                                'No Link Available'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
}

export default ShowsTable;