import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';

function BandProfile() {
  const { id } = useParams(); // Use "id" to match the route parameter
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bandData, setBandData] = useState(null);
  const [error, setError] = useState(null);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const fetchBandData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcup/bands/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBandData(data || {});
      } catch (error) {
        setError('An error occurred while fetching the band data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchShows = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcup/shows/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const showsData = await response.json();
        setShows(showsData);
      } catch (error) {
        console.error('Failed to fetch shows for the band:', error);
      }
    };

    fetchBandData();
    fetchShows();
  }, [id]);

  const handleEdit = () => {
    navigate(`/bands/${bandData.id}/edit`); // For editing  
    console.log('Band Data:', bandData);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!bandData) return <Typography>Band data not found</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {bandData.band}
      </Typography>

      {/* Edit Button */}
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" color="primary" onClick={handleEdit}>
          Edit Band
        </Button>
      </Box>

      {/* Social Links */}
      {bandData.social_links && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Social Links
          </Typography>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <ul>
              {Object.entries(bandData.social_links).map(([platform, url], index) => (
                <li key={index}>
                  <Typography variant="body1">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  </Typography>
                </li>
              ))}
            </ul>
          </Paper>
        </Box>
      )}

      {/* Shows Table */}
      {shows.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Past and Future Shows
          </Typography>
          <Paper elevation={3} sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Venue</strong></TableCell>
                  <TableCell><strong>Start Time</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shows.map((show, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(show.start).toLocaleDateString()}</TableCell>
                    <TableCell>{show.venue}</TableCell>
                    <TableCell>{new Date(show.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default BandProfile;