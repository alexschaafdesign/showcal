import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Stack, Button, Modal } from "@mui/material";
import Grid from "@mui/material/Grid";
import formatBandData from "../utils/formatBandData";
import AppBreadcrumbs from "../components/Breadcrumbs";
import InfoCard from "../components/InfoCard";

const TCUPBandProfile = () => {
  const { bandid } = useParams();
  const navigate = useNavigate();
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleOpen = (image) => {
    setSelectedImage(image);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!band) return <Typography>Band not found</Typography>;

  const images = Array.isArray(band.images) ? band.images : [];

  const handleEdit = () => {
    navigate(`/tcupbands/${bandid}/edit`, { state: { band } });
  };

  return (
    <Box sx={{ padding: 3 }}>
      <AppBreadcrumbs />

      <Grid container spacing={3} alignItems="flex-start">
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Box>
            {/* Profile Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="h2"
                textAlign="left"
                gutterBottom
                sx={{ textTransform: "uppercase" }}
              >
                {band.name}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                sx={{ marginBottom: 2 }}
              >
                Edit Band
              </Button>
            </Box>

            {/* Profile Picture */}
            <Box
              component="img"
              src={`http://localhost:3001${images[0]}`}
              alt="Profile Picture"
              onClick={() => handleOpen(images[0])} // Add the click handler here
              sx={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                marginBottom: 2,
                cursor: "pointer", // Add pointer cursor to indicate it's clickable
              }}
            />

            {/* Info Cards */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <InfoCard label="Genre" value={band.genre} />
              <InfoCard label="Contact Info" value={band.contact} />
            </Box>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          {/* Photos Section */}
          <Typography variant="h5" gutterBottom>
            Photos
          </Typography>
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
            {images.length > 0 ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                {images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={`http://localhost:3001${image}`}
                    alt={`Band Photo ${index + 1}`}
                    onClick={() => handleOpen(image)}
                    sx={{
                      width: { xs: "100%", sm: "calc(33.333% - 16px)" },
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography>No Images Available</Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Modal for viewing an image */}
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
      outline: "none", // Explicitly remove focus outline for the modal
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
          display: "block",
          margin: "auto",
          outline: "none", // Explicitly remove focus outline for the image
          border: "none",
          boxShadow: "none", // Ensure no extra shadow is applied
        }}
        tabIndex={-1} // Prevent the image from being focusable
      />
    )}
  </Box>
</Modal>
    </Box>
  );
};

export default TCUPBandProfile;