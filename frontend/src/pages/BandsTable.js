import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  TextField,
} from '@mui/material';

const BandTable = () => {
  const [bands, setBands] = useState([]);
  const [filteredBands, setFilteredBands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(2); // Active tab index, assuming "Bands" is the third tab
  const navigate = useNavigate();
  const location = useLocation(); // Access the state passed from navigate
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch bands on load
  useEffect(() => {
    const fetchBands = async () => {
      try {
        const response = await fetch('http://localhost:3001/tcup?table=bands');
        if (!response.ok) {
          throw new Error('Failed to fetch bands');
        }
        const data = await response.json();
        setBands(data);
        setFilteredBands(data); // Initialize filteredBands with all bands
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchBands();
  }, []);

  // Check for success message from navigate state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);

      // Clear the message after a few seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [location.state]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) navigate('/showstable'); // Navigate to Shows table
    if (newValue === 1) navigate('/venuestable'); // Navigate to Venues table
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter bands based on the search query
    const filtered = bands.filter((band) =>
      band.band.toLowerCase().includes(query)
    );
    setFilteredBands(filtered);
  };

  const handleBandClick = (bandId) => {
    navigate(`/bands/${bandId}/view`); // Navigate to BandProfile with band ID
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error}</Typography>;

  return (
    <Box sx={{ padding: 0 }}>
      {/* Success Message */}
      {successMessage && (
        <Typography variant="h3" color="success" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Shows" />
          <Tab label="Venues" />
          <Tab label="Bands" />
        </Tabs>
      </Box>

      <Typography variant="h1" gutterBottom textAlign={'center'}>
        TWIN CITIES BAND LIST
      </Typography>

      <Typography variant="h4" gutterBottom textAlign={'center'}>
        brought to you by <a href="https://www.tcupboard.org">TCUP</a>
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search Bands"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          fullWidth
        />
      </Box>

      {/* Bands Table */}
      <Typography variant="h5" gutterBottom>
        Bands
      </Typography>
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Band Name</strong></TableCell>
              <TableCell><strong>Social Links</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBands.map((band) => (
              <TableRow key={band.id}>
                <TableCell
                  onClick={() => handleBandClick(band.id)}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="body1">{band.band}</Typography>
                </TableCell>
                <TableCell>
                  {band.social_links && typeof band.social_links === 'object' ? (
                    Object.entries(band.social_links).map(([platform, link]) => {
                      if (link) {
                        return (
                          <Typography key={platform} variant="body2">
                            <a
                              href={link.startsWith('http') ? link : `https://${link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </a>
                          </Typography>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <Typography variant="body2">No Links</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default BandTable;