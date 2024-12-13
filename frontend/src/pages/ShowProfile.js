import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
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

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {show && show.name} {/* Display the show name */}
      </Typography>

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

        {/* Add any other details as necessary */}
      </Paper>

      {/* Show List of Bands (if available) */}
      {show.bands && show.bands.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bands Performing:
          </Typography>
          <ul>
            {show.bands.map((band) => (
              <li key={band.id}>{band.name}</li>
            ))}
          </ul>
        </Box>
      )}

      {/* Back Button */}
      <Button variant="contained" color="primary" onClick={() => navigate('/shows')}>
        Back to Shows
      </Button>
    </Box>
  );
};

export default ShowProfile;