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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';


function ShowsTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [activeTab, setActiveTab] = useState(0); // State for active tab
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/tcup?table=shows')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched show data:", data);
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setData([]);
        }
      })
      .catch(error => console.error("Error fetching show data:", error));
  }, []);

  const filterFutureEvents = (data) => {
    const today = new Date();
    return data.filter(item => item.start && new Date(item.start) >= today);
  };

  const filterEvents = (data) => {
    let filteredData = filterFutureEvents(data);

    if (selectedVenue) {
      filteredData = filteredData.filter(item => item.venue.toLowerCase().includes(selectedVenue.toLowerCase()));
    }

    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.venue.toLowerCase().includes(searchTerm) ||
        item.bands.toLowerCase().includes(searchTerm)
      );
    }

    return filteredData;
  };

  const groupByDate = (data) => {
    const filteredData = filterEvents(data);
    const grouped = {};
    filteredData.forEach(item => {
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
    navigate(`/bands/${encodeURIComponent(bandId)}/view`);
  };

  const handleVenueClick = (venueName) => {
    navigate(`/venues/${encodeURIComponent(venueName)}`);
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
          <Tab label="Venues" onClick={() => navigate('/venuestable')} />
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
        {[...new Set(data.map(item => item.venue))].map((venue, index) => (
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
              <TableCell>Venue</TableCell>
              <TableCell>Bands</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>Flyer</TableCell>
              <TableCell>Event Link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No events found for the selected criteria.</TableCell>
              </TableRow>
            ) : (
              sortedDates.map(date => (
                <React.Fragment key={date}>
                  <TableRow>
                    <TableCell colSpan={5} style={{ textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', background: '#d8d8d8' }}>
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
                              <TableCell style={{ textTransform: 'uppercase', fontWeight: '400', fontSize: '1.1rem' }}>{item.venue}</TableCell>
                        <TableCell>
                          {item.bands.split(', ').map((band, index) => (
                            <span key={index}>
                              <Button
                                onClick={() => handleBandClick(band)}
                                style={{ textTransform: 'none', fontSize: '1rem' }}
                                variant="text"
                              >
                                {band}
                              </Button>
                              {index < item.bands.split(', ').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </TableCell>
                        <TableCell>{new Date(item.start).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}</TableCell>
                        <TableCell>
                          {item.flyerImage ? (
                            <img
                              src={item.flyerImage}
                              alt="Flyer"
                              style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '5px' }}
                            />
                          ) : (
                            "No Flyer"
                          )}
                        </TableCell>
                        <TableCell>
                          {item.eventLink ? (
                            <a href={item.eventLink} target="_blank" rel="noopener noreferrer">
                              Event Link
                            </a>
                          ) : (
                            "No Link Available"
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