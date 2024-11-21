import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const VenueProfile = () => {
  const { venueName } = useParams(); // Get the venue name from the URL
  const [venue, setVenue] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenueAndShows = async () => {
      try {
        // Fetch venue details
        const venueResponse = await fetch(`http://localhost:3001/tcup/venues/${encodeURIComponent(venueName)}`);
        if (!venueResponse.ok) {
          throw new Error("Venue Not Found");
        }
        const venueData = await venueResponse.json();
        setVenue(venueData);

        // Fetch shows for this venue
        const showsResponse = await fetch(`http://localhost:3001/tcup/shows?venue=${encodeURIComponent(venueName)}`);
        if (!showsResponse.ok) {
          throw new Error("Failed to fetch shows");
        }
        const showsData = await showsResponse.json();
        setShows(showsData);
        setLoading(false);
      } catch (error) {
        setError(error.message || "An error occurred while fetching the data.");
        setLoading(false);
      }
    };

    fetchVenueAndShows();
  }, [venueName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {venue.venue}
      </Typography>

      {/* Display the venue cover image */}
      {venue.cover_image && (
        <Box sx={{ mb: 3 }}>
          <img
            src={`http://localhost:3001/images/${venue.cover_image}`} // This assumes images are served at this endpoint
            alt={`${venue.venue} cover`}
            style={{
              width: '50%',   // Make it responsive by setting width to 100% of its container
              height: 'auto',  // Maintain the aspect ratio
              objectFit: 'contain' // Ensures image fits without distortion
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Bands</strong></TableCell>
                  <TableCell><strong>Event Link</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shows.map((show) => (
                  <TableRow key={show.id}>
                    <TableCell>{new Date(show.start).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(show.start).toLocaleTimeString()}</TableCell>
                    <TableCell>{show.bands.join(', ')}</TableCell>
                    <TableCell>
                      {show.event_link ? (
                        <a href={show.event_link} target="_blank" rel="noopener noreferrer">
                          Link
                        </a>
                      ) : (
                        "No Link"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Typography variant="body2">No upcoming shows for this venue.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default VenueProfile;