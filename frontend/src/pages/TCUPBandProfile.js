import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";

const TCUPBandProfile = () => {
  const { id } = useParams(); // Get the band ID from the URL
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcup/tcupbands/${id}`);
        if (!response.ok) throw new Error("Failed to fetch band data");
        const data = await response.json();
        setBand(data);
      } catch (err) {
        console.error("Error fetching band:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBand();
  }, [id]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!band) return <Typography>Band not found</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {band.name}
      </Typography>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="body1">
          Genre: {band.genre || "No Genre"}
        </Typography>
        <Typography variant="body1">
          Contact Info: {band.contact || "No Contact Info"}
        </Typography>
        <Typography variant="body1">
          Looking to Play Shows? {band.play_shows || "No Preference"}
        </Typography>
        <Typography variant="body1">
          Group Size: {band.group_size ? band.group_size.join(", ") : "No Group Size"}
        </Typography>
        <Typography variant="body1">
          Social Links:
          {band.social_links && (
            <ul>
              {band.social_links.instagram && (
                <li>
                  <a href={`https://instagram.com/${band.social_links.instagram}`} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
              )}
              {band.social_links.spotify && (
                <li>
                  <a href={band.social_links.spotify} target="_blank" rel="noopener noreferrer">
                    Spotify
                  </a>
                </li>
              )}
            </ul>
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default TCUPBandProfile;