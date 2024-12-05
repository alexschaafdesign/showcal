
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Modal, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import formatBandData from "../utils/formatBandData";
import AppBreadcrumbs from "../components/Breadcrumbs";
import ProfilePhotoCard from "../components/ProfilePhotoCard";
import ShowsTableCore from "./ShowsTableCore";

const TCUPBandProfile = ({ allShows = [] }) => {
  const { bandid } = useParams();
  const navigate = useNavigate();
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch band data on mount
  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcupbands/${bandid}`);
        if (!response.ok) throw new Error("Failed to fetch band data");
        const data = await response.json();
        const formattedBand = formatBandData(data.data);
        setBand(formattedBand);
      } catch (err) {
        console.error("Error fetching band:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBand();
  }, [bandid]);

  // Compute bandShows using useMemo
  const parsedBandid = parseInt(bandid, 10);
  const bandShows = useMemo(() => {
    if (!Array.isArray(allShows)) return [];
    return allShows.filter(
      (show) =>
        Array.isArray(show.bands) &&
        show.bands.some((band) => band.id === parsedBandid)
    );
  }, [allShows, parsedBandid]);

  // Conditional rendering for loading, errors, and missing band data
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!band) return <Typography>Band not found</Typography>;

  // Spotify Embed URL Conversion
  const spotifyEmbedUrl = band?.music_links?.spotify
  ? band.music_links.spotify.includes("/embed/")
    ? band.music_links.spotify // Already an embed link
    : band.music_links.spotify.replace(
        /open\.spotify\.com\/(track|album|playlist|artist)\//,
        "open.spotify.com/embed/$1/"
      )
  : null;

  const getBandcampEmbedUrl = (url) => {
    // Matches typical album or track URLs
    const match = url.match(/https:\/\/([\w-]+)\.bandcamp\.com\/(album|track)\/([\w-]+)/);
    if (match) {
      const artist = match[1];
      const type = match[2];
      const slug = match[3];
      return `https://${artist}.bandcamp.com/${type}/${slug}`;
    }
    return null; // Invalid URL
  };

  // Handle modal image
  const handleOpen = (image) => {
    if (image) {
      setSelectedImage(image);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  // Navigate to edit page
  const handleEdit = () => {
    if (band) {
      navigate(`/tcupbands/${bandid}/edit`, { state: { band } });
    }
  };

  // Conditional rendering for loading, errors, and missing band data
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!band) return <Typography>Band not found</Typography>;

  // Band profile image handling
  const images = Array.isArray(band.images) ? band.images : [];
  const imageUrl =
    band.profile_photo ||
    (images?.[0] ? `http://localhost:3001${images[0]}` : "/assets/images/tcup_logo.jpg");

  return (
    <Box sx={{ padding: 3 }}>
      <AppBreadcrumbs />

      <Grid container spacing={3} alignItems="flex-start">
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <ProfilePhotoCard
            name={band.name}
            imageUrl={imageUrl}
            onEdit={handleEdit}
            socialLinks={band.social_links}
            genre={band.genre}
          />

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"

              fullWidth
              onClick={handleEdit}
              sx={{ marginBottom: 2 }}
            >
              Edit Band Profile
            </Button>
          </Box>

          <Box sx={{ marginTop: 4 }}>
          {/* Bio Header */}
          <Typography variant="h5" gutterBottom>
            Bio
          </Typography>

          {/* Bio Body */}
          <Typography variant="body1" color="textSecondary">
            Here's a spot to put your bio or whatever lorem lorem married ipsum and ispsum and lorem had a wonderful ipsum and lorem life together. 
          </Typography>
        </Box>

        <Box sx={{ marginTop: 4 }}>
  {/* Links Header */}
  <Typography variant="h5" gutterBottom>
    Links
  </Typography>

  {/* Links Content */}
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
    {/* First Column */}
    <Box sx={{ flex: 1, minWidth: '45%' }}>
      <Typography>
        <a
          href="https://drive.google.com/file/d/1mDjatch2BQOje0g0sV5YzYhChjN5Oei8/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#8E6CD1', textDecoration: 'none' }}
        >
          Stage Plot
        </a>
      </Typography>
    </Box>

    {/* Second Column */}
    <Box sx={{ flex: 1, minWidth: '45%' }}>
      <Typography>
        <a
          href="https://instagram.com/yellowostrich"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#8E6CD1', textDecoration: 'none' }}
        >
          Instagram
        </a>
      </Typography>
    </Box>
  </Box>
  <Grid item xs={12} md={8}>
          <Box sx={{ width: "100%", marginTop: 4, display: "flex", flexDirection: "column" }}>
            {images.length > 0 ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="flex-start"
              >
                {images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={`http://localhost:3001${image}`}
                    alt={`Band Photo ${index + 1}`}
                    onClick={() => handleOpen(image)}
                    sx={{
                      width: { xs: "80px", sm: "100px" }, // Thumbnail size
                      height: { xs: "80px", sm: "100px" }, // Maintain square aspect ratio
                      objectFit: "cover", // Ensures the image is contained within the box
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)", // Subtle shadow
                      cursor: "pointer",
                      transition: "transform 0.2s", // Add hover effect
                      "&:hover": {
                        transform: "scale(1.05)", // Slightly enlarge on hover
                      },
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography>No images available.</Typography>
            )}
          </Box>
        </Grid>
</Box>


        </Grid>

        {/* Right Column */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            display: "flex", 
            flexGrow: 1,
            flexDirection: "column", 
            justifyContent: "space-between", // Space out elements vertically
            height: "100%", // Ensure the column itself stretches
          }}
        >

            {/* Spotify Embed */}
            {spotifyEmbedUrl && (
            <Box
              sx={{
                flexGrow: 1, // Allow it to grow and take up available space
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <iframe
                src={spotifyEmbedUrl}
                width="100%"
                height="600px"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title="Spotify Player"
                style={{
                  borderRadius: "8px",
                  border: "none",
                }}
              ></iframe>
            </Box>
          )}


          {/* Bandcamp Embed
          {band?.music_links?.bandcamp && (
            <Box mt={2}>
              <iframe
                src={band.music_links.bandcamp}
                width="100%" // Adjust width as needed
                height="100px" // Keep the height consistent with the standard
                frameBorder="0"
                seamless
                style={{
                  border: "none",
                  borderRadius: "8px",
                }}
                title="Bandcamp Player"
              ></iframe>
            </Box>
          )} */}


        </Grid>
        </Grid>

          {/* Bottom show section */}


         
        <Box  
          sx={{
            marginTop: 4,
          }}
        > 
          {bandShows.length > 0 ? (
            <ShowsTableCore
              data={bandShows}
              onBandClick={(bandid) => console.log("Band clicked:", bandid)}
              onVenueClick={(venueid) => console.log("Venue clicked:", venueid)}
            />
          ) : (
            <Typography>No upcoming shows for this band.</Typography>
          )}
        </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "transparent",
            boxShadow: "none",
            p: 0,
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            outline: "none",
          }}
        >
          {selectedImage && (
            <img
              src={`http://localhost:3001${selectedImage}`}
              alt="Expanded Image"
              style={{
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "calc(100vh - 32px)",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default TCUPBandProfile;