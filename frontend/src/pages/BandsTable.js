import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  TextField
} from '@mui/material';

function Bands() {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Fetch the band data when the component mounts
  useEffect(() => {
    fetch('http://localhost:3001/tcup?table=bands')  // Updated URL to include query parameter
      .then(response => response.json())
      .then(data => {
        setBands(data);
        setLoading(false); // Data is loaded, stop the loading spinner
      })
      .catch(error => {
        console.error('Error fetching bands:', error);
        setLoading(false); // Stop loading on error
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter bands based on search term
  const filteredBands = bands.filter((band) => 
    band.band.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort bands alphabetically
  const sortedBands = filteredBands.sort((a, b) => a.band.localeCompare(b.band));

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bands
      </Typography>

      {/* Search field */}
      <TextField
        variant="outlined"
        label="Search Bands"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Update search term state
      />

      {/* Display the number of bands in the table */}
      <Typography variant="body1" gutterBottom>
        There are currently {filteredBands.length} {filteredBands.length === 1 ? 'band' : 'bands'} in this table.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Band Name</TableCell>
              <TableCell>Social Links</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">No bands found.</TableCell>
              </TableRow>
            ) : (
              sortedBands.map((band, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {/* Wrap the band name in a Link to make it clickable */}
                    <Link to={`/bands/${encodeURIComponent(band.band)}`}>
                      <Button variant="text">{band.band}</Button>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {band.socialLinks ? (
                      Object.entries(band.socialLinks).map(([platform, link], idx) => (
                        <Box key={idx} mb={1}>
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            <Button variant="contained" color="primary">
                              {platform}
                            </Button>
                          </a>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2">No social links available</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Bands;