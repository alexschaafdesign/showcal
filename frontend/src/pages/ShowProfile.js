import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  Chip,
} from '@mui/material';

const ShowProfile = () => {
  const { id } = useParams();  // Get the show ID from the URL
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const response = await fetch(`${apiUrl}/shows/${id}`);
        if (!response.ok) throw new Error("Show not found");
        const showData = await response.json();
        setShow(showData);
      } catch (error) {
        setError(error.message || "An error occurred while fetching the show.");
      } finally {
        setLoading(false);
      }
    };

    if (id && apiUrl) {
      fetchShow();
    } else {
      setError("Invalid show ID or API URL");
      setLoading(false);
    }
  }, [id, apiUrl]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleBandClick = (bandId) => {
    if (bandId) {
      navigate(`/tcupbands/${bandId}`);  // Navigate to the band profile page
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {show && show.name} {/* Display the show name */}
      </Typography>

      {/* Show Flyer */}
      <Box sx={{ display: "flex", justifyContent: "center", padding: "0px", mt: 3 }}>
        {show.flyer_image ? (
          <img
            src={show.flyer_image}  // Directly using the URL from the DB
            alt="Show Flyer"
            style={{
              maxWidth: '100%',  // Adjust to your layout
              width: '500px',    // Set a max width
              borderRadius: '8px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Typography>No Flyer Available</Typography>  // Fallback message
        )}
      </Box>

      <Box sx={{ marginTop: 3 }}>
        {/* Show Event Link */}
        {show.event_link ? (
          <Typography variant="h3" gutterBottom>
            <a href={show.event_link} target="_blank" rel="noopener noreferrer">
              GET TICKETS / MORE INFO
            </a>
          </Typography>
        ) : (
          <Typography>No event link available</Typography>  // Fallback message
        )}
      </Box>

      {/* Show List of Bands (if available) */}
      {show.bands && show.bands.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", mt: 3 }}>
          {show.bands.map((band, index) => (
            <Typography
              key={band.id}
              variant={index === 0 ? "h4" : "body1"} // First band is large (h4), others are body1
              sx={{
                fontWeight: band.id ? 'bold' : 'normal', // Bold the band name if it has an ID
                fontSize: index === 0 ? '2rem' : '1rem', // Make the first band bigger
                marginTop: index === 0 ? 0 : 1, // Adds margin top for subsequent bands
                color: band.id ? 'primary.main' : 'text.secondary', // Customize colors
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
              onClick={() => handleBandClick(band.id)}  // Make the band clickable and navigate
            >
              {band.name}
              {band.id && (
                <Chip
                  label="TCUP BAND"
                  color="primary"
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                />
              )}
            </Typography>
          ))}
        </Box>
      )}

      {/* Show Details */}
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>
          <strong>Start Time:</strong> {new Date(show.start).toLocaleString()}
        </Typography>

        <Typography variant="h6" gutterBottom>
          <strong>Venue:</strong> {show.venue_name}
        </Typography>

        {/* Display any additional show details */}
        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> {show.description || "No description available"}
        </Typography>
      </Paper>

      {/* Back Button */}
      <Button variant="contained" color="primary" onClick={() => navigate('/shows')}>
        Back to Shows
      </Button>
    </Box>
  );
};

export default ShowProfile;