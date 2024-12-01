import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavigationTabs from '../components/NavigationTabs'; // Adjust path as needed
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  TextField,
} from '@mui/material';
import BandSocialLinks from '../components/BandSocialLinks';



const BandTable = () => {
  const [bands, setBands] = useState([]);
  const [filteredBands, setFilteredBands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Access the state passed from navigate
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch bands on load
  useEffect(() => {
    const fetchBands = async () => {
      try {
        const response = await fetch('http://localhost:3001/bands');
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
      <NavigationTabs />

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
                <BandSocialLinks links={band.social_links} />
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