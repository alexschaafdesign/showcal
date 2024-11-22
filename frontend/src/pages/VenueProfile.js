import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';

const VenueProfile = () => {
  const { id } = useParams(); // Get the venue ID from the URL
  const [venue, setVenue] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        console.log(`Fetching venue from http://localhost:3001/tcup/venues/${id}`);
        const venueResponse = await fetch(`http://localhost:3001/tcup/venues/${id}`);
        if (!venueResponse.ok) throw new Error("Venue Not Found");
        const venueData = await venueResponse.json();
        console.log("Fetched venue data:", venueData);
        setVenue(venueData);
      } catch (error) {
        console.error("Error fetching venue:", error);
        setError(error.message || "An error occurred while fetching the venue.");
      } finally {
        setLoading(false);
      }
    };

    const fetchShows = async () => {
      try {
        console.log(`Fetching shows from http://localhost:3001/tcup/shows?venue=${id}`);
        const showsResponse = await fetch(`http://localhost:3001/tcup/shows?venue=${id}`);
        if (!showsResponse.ok) throw new Error("Failed to fetch shows");
        const showsData = await showsResponse.json();
        console.log("Fetched shows data:", showsData);
        setShows(showsData);
      } catch (error) {
        console.error("Error fetching shows:", error);
        setError(error.message || "An error occurred while fetching the shows.");
      }
    };

    fetchVenue();
    fetchShows();
  }, [id]);

  const handleBandClick = (band) => {
    console.log(`Navigating to band: ${band}`);
    // Implement band profile navigation
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Box sx={{ padding: 3 }}>
      {/* Venue Title */}
      <Typography variant="h4" gutterBottom>
        {venue.venue}
      </Typography>

      {/* Display the venue cover image */}
      {venue.cover_image && (
        <Box sx={{ mb: 3 }}>
          <img
            src={`http://localhost:3001/images/${venue.cover_image}`} // Assumes images are served here
            alt={`${venue.venue} cover`}
            style={{
              width: '50%', // Responsive to container width
              height: 'auto', // Maintains aspect ratio
              objectFit: 'contain', // Avoids distortion
            }}
          />
        </Box>
      )}

      {/* Display other venue details */}
      <Typography variant="body1" gutterBottom>
        <strong>Location:</strong> {venue.location}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Capacity:</strong> {venue.capacity}
      </Typography>

      {/* Display shows associated with the venue */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upcoming Shows
        </Typography>
        {shows.length > 0 ? (
          <Paper elevation={3}>
            <TableContainer>
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
                  {shows.map((show) => (
                    <TableRow key={show.id}>
                      <TableCell>{venue.venue}</TableCell> {/* Static since it’s the same venue */}
                      <TableCell>
                        {show.bands
                          .split(', ')
                          .map((band, index) => (
                            <Button
                              key={index}
                              onClick={() => handleBandClick(band)}
                              style={{ textTransform: 'none', fontSize: '1rem' }}
                              variant="text"
                            >
                              {band}
                            </Button>
                          ))}
                      </TableCell>
                      <TableCell>
                        {new Date(show.start).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </TableCell>
                      <TableCell>
                        {show.flyer_image ? (
                          <img
                            src={show.flyer_image}
                            alt="Flyer"
                            style={{
                              maxWidth: '100px',
                              maxHeight: '100px',
                              borderRadius: '5px',
                            }}
                          />
                        ) : (
                          'No Flyer'
                        )}
                      </TableCell>
                      <TableCell>
                        {show.event_link ? (
                          <a href={show.event_link} target="_blank" rel="noopener noreferrer">
                            Event Link
                          </a>
                        ) : (
                          'No Link Available'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Typography variant="body2">No upcoming shows for this venue.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default VenueProfile;