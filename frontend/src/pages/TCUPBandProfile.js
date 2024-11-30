import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Stack } from "@mui/material";
import formatBandData from "../utils/formatBandData";

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
  
        // Format the band data
        const formattedBand = formatBandData(data.data);
  
        setBand(formattedBand); // Ensure correct access to the band object
        console.log("Band Images on Frontend:", data.data.images); // Log the images

      } catch (err) {
        console.error("Error fetching band:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBand();
  }, [bandid]);

  // Handle loading and error states
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Ensure band exists
  if (!band) return <Typography>Band not found</Typography>;

  // Ensure images exist
  const images = Array.isArray(band.images) ? band.images : [];


  return (
    <Box sx={{ padding: 3 }}>
      {/* Band Name */}
      <Typography variant="h4" textAlign={"center"} gutterBottom>
        {band.name}
      </Typography>

      {/* Images Section */}
      <Box sx={{ marginBottom: 3 }}>
      {console.log("Rendering Band Images:", band.images)} {/* Debugging */}
      {band && Array.isArray(band.images) && band.images.length > 0 ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          {band.images.map((image, index) => {
            const imageSrc = `http://localhost:3001${image}`; // Construct the path
            console.log(`Image ${index} Source:`, imageSrc); // Log each constructed src
            return (
              <Box
                key={index}
                component="img"
                src={imageSrc} // Use constructed path
                alt={`Band Photo ${index + 1}`}
                sx={{
                  width: { xs: "100%", sm: "calc(33.333% - 16px)" },
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                }}
              />
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body1">No Images Available</Typography>
      )}
    </Box>
      {/* Band Details */}
      <Paper sx={{ padding: 2, mb: 3 }}>
        <Typography variant="body1">
          <strong>Genre:</strong> {band.genre || "No Genre"}
        </Typography>
        <Typography variant="body1">
          <strong>Contact Info:</strong> {band.contact || "No Contact Info"}
        </Typography>
        <Typography variant="body1">
          <strong>Looking to Play Shows?</strong> {band.play_shows || "No Preference"}
        </Typography>
        <Typography variant="body1">
          <strong>Group Size:</strong>{" "}
          {band.group_size && band.group_size.length > 0
            ? band.group_size.join(", ")
            : "No Group Size"}
        </Typography>
        <Typography variant="body1">
          <strong>Social Links:</strong>
          {band.social_links ? (
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
              {band.social_links.bandcamp && (
                <li>
                  <a
                    href={band.social_links.bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Bandcamp
                  </a>
                </li>
              )}
              {band.social_links.soundcloud && (
                <li>
                  <a
                    href={band.social_links.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SoundCloud
                  </a>
                </li>
              )}
              {band.social_links.website && (
                <li>
                  <a
                    href={band.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </a>
                </li>
              )}
            </ul>
          ) : (
            "No Social Links Available"
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default TCUPBandProfile;