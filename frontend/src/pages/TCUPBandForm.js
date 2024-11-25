import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const TCUPBandForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const bandData = location.state?.band || {}; // Retrieve band data if editing

  // Initialize state
  const [formData, setFormData] = useState({
    name: bandData.name || "",
    genre: bandData.genre || "",
    contact: bandData.contact || "",
    play_shows: bandData.play_shows || "",
    group_size: bandData.group_size || [],
    photos: [],
    social_links: {
      instagram: bandData.social_links?.instagram || "",
      spotify: bandData.social_links?.spotify || "",
      bandcamp: bandData.social_links?.bandcamp || "",
      soundcloud: bandData.social_links?.soundcloud || "",
      website: bandData.social_links?.website || "",
    },
    stage_plot: null,
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input change for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle group size checkbox change
  const handleGroupSizeChange = (e) => {
    const { value } = e.target;
    const newGroupSize = formData.group_size.includes(value)
      ? formData.group_size.filter((size) => size !== value)
      : [...formData.group_size, value];
    setFormData({ ...formData, group_size: newGroupSize });
  };

  // Handle file changes for photos and stage plot
  const handleFileChange = (e) => {
    const { name } = e.target;
    if (name === "photos") {
      setPhotoFiles(Array.from(e.target.files).slice(0, 3)); // Limit to 3 photos
    } else if (name === "stage_plot") {
      setPdfFile(e.target.files[0]); // Set stage plot file
    }
  };

  // Handle social links change
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [name]: value,
      },
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (!formData.name.trim()) {
      setErrorMessage("Band name is required.");
      return;
    }
  
    try {
      const url = isEdit
        ? `http://localhost:3001/tcup/tcupbands/${bandData.id}` // Update endpoint
        : "http://localhost:3001/tcup/tcupbands"; // Create endpoint
  
      const method = isEdit ? "PUT" : "POST";
  
      // Create FormData object for submission
      const dataToSubmit = new FormData();
      dataToSubmit.append("name", formData.name);
      dataToSubmit.append("genre", formData.genre);
      dataToSubmit.append("play_shows", formData.play_shows);
      dataToSubmit.append("contact", formData.contact);
      dataToSubmit.append("group_size", JSON.stringify(formData.group_size));
      dataToSubmit.append("social_links", JSON.stringify(formData.social_links));
  
      // Add photo files
      photoFiles.forEach((photo) => dataToSubmit.append("photos", photo));
  
      // Add stage plot PDF
      if (pdfFile) {
        dataToSubmit.append("stage_plot", pdfFile);
      }
  
      // Send the data using fetch
      const response = await fetch(url, {
        method,
        body: dataToSubmit,
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit band data");
      }
  
      const successMsg = isEdit
        ? "Band updated successfully!"
        : "Band added successfully!";
      setSuccessMessage(successMsg);
  
      // Redirect to the TCUPBandsTable with a success message
      setTimeout(() => {
        navigate("/tcupbands", { state: { successMessage: successMsg } });
      }, 2000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setErrorMessage("Failed to submit band data. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? "Edit Band" : "Add a New Band"}
      </Typography>

      {/* Error / Success Messages */}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Band Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Contact Info"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Looking to Play Shows?</InputLabel>
          <Select
            name="play_shows"
            value={formData.play_shows}
            onChange={handleChange}
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="maybe">Maybe</MenuItem>
            <MenuItem value="not right now">Not Right Now</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">Group Size</Typography>
          {["Solo", "Duo", "Trio", "4-piece", "5+ piece"].map((size) => (
            <FormControlLabel
              key={size}
              control={
                <Checkbox
                  checked={formData.group_size.includes(size)}
                  onChange={handleGroupSizeChange}
                  value={size}
                />
              }
              label={size}
            />
          ))}
        </Box>
        <TextField
          label="Instagram Username"
          name="instagram"
          value={formData.social_links.instagram}
          onChange={handleSocialLinkChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Spotify Link"
          name="spotify"
          value={formData.social_links.spotify}
          onChange={handleSocialLinkChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          component="label"
          sx={{ mb: 2 }}
        >
          Upload Photos
          <input
            type="file"
            name="photos"
            multiple
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        <Button
          variant="contained"
          component="label"
          sx={{ mb: 2 }}
        >
          Upload Stage Plot
          <input
            type="file"
            name="stage_plot"
            hidden
            accept=".pdf"
            onChange={handleFileChange}
          />
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {isEdit ? "Update Band" : "Add Band"}
        </Button>
      </form>
    </Box>
  );
};

export default TCUPBandForm;