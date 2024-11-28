import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from '@mui/material';
import NavigationTabs from '../components/NavigationTabs';

const VenuesTable = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('http://localhost:3001/tcup?table=venues');
        if (!response.ok) {
          throw new Error('Failed to fetch venues');
        }
        const data = await response.json();
        setVenues(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const handleVenueClick = (id) => {
    console.log(`Navigating to venue with id: ${id}`);
    navigate(`/venues/${id}`); // Navigate to the VenueProfile using the venue ID
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error}</Typography>;

  return (
    <Box sx={{ padding: 0 }}>
      
      <NavigationTabs />

      <Typography variant="h1" gutterBottom textAlign={'center'}>
        TWIN CITIES VENUE LIST
      </Typography>

      <Typography variant="h4" gutterBottom textAlign={'center'}>
        brought to you by <a href="https://www.tcupboard.org">TCUP</a>
      </Typography>

      {/* Venues Table */}
      <Typography variant="h5" gutterBottom>
        Venues
      </Typography>
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Venue Name</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Capacity</strong></TableCell>
              <TableCell><strong>Cover Image</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {venues.map((venue) => (
              <TableRow key={venue.id}>
                <TableCell
                  onClick={() => handleVenueClick(venue.id)}
                  style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                >
                  {venue.venue}
                </TableCell>
                <TableCell>{venue.location}</TableCell>
                <TableCell>{venue.capacity}</TableCell>
                <TableCell>
                  {venue.cover_image ? (
                    <img
                      src={`http://localhost:3001/images/${venue.cover_image}`}
                      alt={`${venue.venue} cover`}
                      style={{ width: '100px', height: 'auto' }}
                    />
                  ) : (
                    'No Image'
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

export default VenuesTable;