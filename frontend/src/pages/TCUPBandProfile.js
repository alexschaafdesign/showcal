
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

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

  // Fetch band data on mount
  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await fetch(`${apiUrl}/tcupbands/${bandid}`);  // Use the dynamic URL
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
  }, [bandid, apiUrl]);

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

  // Band profile image handling
  const profileImageUrl = band.profile_image || ""; // Fallback if no profile image
  const otherImages = Array.isArray(band.other_images) ? band.other_images : []; // Ensure it's an array

  return (

    // OVERALL BOX 

    <Box sx={{ padding: 3 }}>

    {/* Box holding the two columns */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3, // Add some margin below the row
          }}
        >

          {/* Breadcrumbs on the top left */}
          <AppBreadcrumbs />

          {/* Edit button on the top right */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEdit}
            sx={{
              textTransform: "none", // Optional: Disable uppercase if undesired
            }}
          >
            Edit your band
          </Button>
        </Box>
          
          {/* Main two-column container */}

              <Grid
            container
            spacing={3}
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >        
            {/* Left Column */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >       
             <ProfilePhotoCard
              name={band.name} // Band name
              imageUrl={band.profile_image} // URL of the profile image
              location={band.location || "Unknown Location"} // Band location, fallback if not available
              genre={band.genre} // Array of genres
              socialLinks={band.social_links} // Object containing social links
              onEdit={() => console.log("Edit button clicked")} // Action for the edit button
            />

            {/* Bio */}
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

             {/* Links */}
             <Box sx={{ marginTop: 4 }}>

            {/* Links Header */}
            <Typography variant="h5" gutterBottom>
              Links
            </Typography>

            {/* Links Content - a two column sub-section */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
              {/* First sub-Column */}
              <Box sx={{ flex: 1, minWidth: '45%' }}>
              <Typography>
                <a
                  href="https://drive.google.com/file/d/1mDjatch2BQOje0g0sV5YzYhChjN5Oei8/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#8E6CD1',
                    textDecoration: 'none',
                    fontSize: '1.25rem', // Adjust the font size as needed
                    fontWeight: 'bold', // Makes the font bold
                  }}
                >
                  Stage Plot (pdf)
                </a>
              </Typography>
              </Box>

                {/* Second sub-Column */}
                <Box sx={{ flex: 1, minWidth: '45%' }}>
                  
                </Box>
            </Box>
              <Grid item xs={12} md={8}>
         
            {/* Other Images */}
            <Box>
              <Typography variant="h5">Other Images</Typography>
              {otherImages.length > 0 ? (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="center"
                  justifyContent="flex-start"
                >
                  {otherImages.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={image}
                      alt={`Band Photo ${index + 1}`}
                      onClick={() => handleOpen(image)}
                      sx={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                  ))}
                </Stack>
                    ) : (
                      <Typography>No additional images available.</Typography>
                    )}
                  </Box>
               </Grid>
            </Box>
           </Grid>

          {/* End of left main column */}

          {/* Right main Column */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
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

            {/* YouTube Music Embed */}
            {band.music_links.youtube && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                YouTube Music Video
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  width: "100%",
                  paddingTop: "56.25%", // Maintain 16:9 aspect ratio
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <iframe
                  src={band.music_links.youtube.replace(
                    "watch?v=",
                    "embed/"
                  )}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  title="YouTube Music Video"
                ></iframe>
                </Box>
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

          {/* Bottom show section that spans full width*/}
        <Box  
          sx={{
            marginTop: 4,
            marginBottom: 12,
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
        
        {/* Image Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "transparent",
              boxShadow: "none",
            }}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Expanded Image"
                style={{
                  maxWidth: "calc(100vw - 32px)",
                  maxHeight: "calc(100vh - 32px)",
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