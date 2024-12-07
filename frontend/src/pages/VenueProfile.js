import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
} from '@mui/material';
import ShowsTableCore from './ShowsTableCore'; // Import your reusable ShowsTableCore

const VenueProfile = () => {
  const { id } = useParams(); // Get the venue ID from the URL
  const [venue, setVenue] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        console.log(`Fetching venue from http://alexschaafdesign.com:3001/tcup/venues/${id}`);
        const venueResponse = await fetch(`http://alexschaafdesign.com:3001/tcup/venues/${id}`);
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
        console.log(`Fetching shows from http://alexschaafdesign.com:3001/tcup/shows?venue=${id}`);
        const showsResponse = await fetch(`http://alexschaafdesign.com:3001/tcup/shows?venue=${id}`);
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

  const handleBandClick = (bandId) => {
    console.log('Band ID clicked:', bandId); // Check if bandId is correct
    if (!bandId) {
      console.error('Invalid band ID:', bandId);
      return;
    }
    navigate(`/bands/${encodeURIComponent(bandId)}/view`);
  };

  const handleVenueClick = () => {
    console.log('Venue clicked'); // You can add specific logic for venue click if needed
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
            src={`http://alexschaafdesign.com:3001/images/venuecoverimages/${venue.cover_image}`} // Assumes images are served here
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
        <ShowsTableCore
          data={shows} // Pass the filtered shows data
          onBandClick={handleBandClick} // Reuse the band click handler
          onVenueClick={handleVenueClick} // Optional venue click handler
        />
      </Box>
    </Box>
  );
};

export default VenueProfile;