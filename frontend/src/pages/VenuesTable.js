import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';

const VenuesTable = () => {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      const response = await fetch('http://localhost:3001/tcup?table=venues');
      const data = await response.json();
      setVenues(data);
    };
    fetchVenues();
  }, []);

  // Sort venues alphabetically by the venue name
  const sortedVenues = [...venues].sort((a, b) => {
    if (a.venue < b.venue) return -1;
    if (a.venue > b.venue) return 1;
    return 0;
  });

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Venues List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Venue</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Cover Image</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedVenues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No venues found.</TableCell>
              </TableRow>
            ) : (
              sortedVenues.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell>
                    <Link to={`/venues/${encodeURIComponent(venue.venue)}`}>{venue.venue}</Link>
                  </TableCell>
                  <TableCell>{venue.location}</TableCell>
                  <TableCell>{venue.capacity}</TableCell>
                  <TableCell>
                    {venue.cover_image ? (
                      <img
                        src={`http://localhost:3001/images/${venue.cover_image}`} 
                        alt={`${venue.venue} cover`}
                        style={{ maxWidth: '150px', maxHeight: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      'No Image'
                    )}
                    {console.log(venue.cover_image)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VenuesTable;