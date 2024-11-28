import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Stack } from "@mui/material";

const TCUPBandProfile = () => {
  const { bandid } = useParams(); // Get the band ID from the URL
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcupbands/${bandid}`);
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
  }, [bandid]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!band) return <Typography>Band not found</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      {/* Band Name */}

      <Typography variant="h4" textAlign={'center'} gutterBottom>
        {band.name}
      </Typography>

      {/* Photos Section */}
      <Box sx={{ marginBottom: 3 }}>
        {band.photos && band.photos.length > 0 ? (
          <Stack
            direction={{ xs: "column", sm: "row" }} // Vertical on small screens, horizontal on medium+
            spacing={2} // Space between items
            alignItems="center" // Center items horizontally
            justifyContent="center" // Center items within the container
          >
            {band.photos.map((photo, index) => (
              <Box
                key={index}
                component="img"
                src={`http://localhost:3001${photo}`}
                alt={`Band ${index + 1}`}
                sx={{
                  width: { xs: "100%", sm: "calc(33.333% - 16px)" }, // Full width on small screens, 1/3 on larger screens
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                }}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body1">No Photos Available</Typography>
        )}
      </Box>

      {/* Band Details */}
      <Paper sx={{ padding: 2, mb: 3 }}>
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
                  <a
                    href={`https://instagram.com/${band.social_links.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {band.social_links.spotify && (
                <li>
                  <a
                    href={band.social_links.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Spotify
                  </a>
                </li>
              )}
            </ul>
          )}
        </Typography>
        <Typography variant="body1">
          Stage Plot:{" "}
          {band.stage_plot ? (
            <a
              href={`http://localhost:3001${band.stage_plot}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Stage Plot
            </a>
          ) : (
            "No Stage Plot Available"
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default TCUPBandProfile;