import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const TCUPBandForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    genre: "",
    contact: "",
    play_shows: "",
    group_size: [],
    photos: [],
    social_links: {
      instagram: "",
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      website: "",
    },
    stage_plot: null,
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGroupSizeChange = (e) => {
    const { value } = e.target;
    const newGroupSize = formData.group_size.includes(value)
      ? formData.group_size.filter((size) => size !== value)
      : [...formData.group_size, value];
    setFormData({ ...formData, group_size: newGroupSize });
  };

// Handle file changes
const handleFileChange = (e) => {
  const { name } = e.target;
  const files = Array.from(e.target.files);

  if (name === "photos") {
    // Combine existing photos with newly uploaded ones
    setPhotoFiles((prev) => [...prev, ...files]);
  } else if (name === "stage_plot") {
    setPdfFile(files[0]);
  }
};

// Remove a specific photo
const removePhoto = (index) => {
  setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
};

// Clear the file input and reset the associated state
const clearFileInput = (name) => {
  const input = document.querySelector(`input[name="${name}"]`);
  if (input) {
    input.value = ""; // Clear the file input value
  }

  if (name === "stage_plot") {
    setPdfFile(null); // Reset the pdfFile state
  } else if (name === "photos") {
    setPhotoFiles([]); // Reset the photoFiles state (optional)
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Band name is required.");
      return;
    }

    try {
      const url = isEdit
        ? `http://localhost:3001/tcup/tcupbands/${formData.id}`
        : "http://localhost:3001/tcup/tcupbands";

      const method = isEdit ? "PUT" : "POST";

      const dataToSubmit = new FormData();
      dataToSubmit.append("name", formData.name);
      dataToSubmit.append("genre", formData.genre);
      dataToSubmit.append("play_shows", formData.play_shows);
      dataToSubmit.append("contact", formData.contact);
      dataToSubmit.append("group_size", JSON.stringify(formData.group_size));
      dataToSubmit.append("social_links", JSON.stringify(formData.social_links));

      photoFiles.forEach((file) => dataToSubmit.append("photos", file));
      if (pdfFile) {
        dataToSubmit.append("stage_plot", pdfFile);
      }

      const response = await fetch(url, { method, body: dataToSubmit });

      if (!response.ok) throw new Error("Failed to submit band data");

      setSuccessMessage("Band submitted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error submitting band data:", err);
      setErrorMessage("Failed to submit band data.");
    }
  };

  return (
    <Box sx={{ 
      paddingTop: 0,
      paddingBottom: 10,
      paddingLeft: 30,
      paddingRight: 30 }}>
      <Typography variant="h1" gutterBottom textAlign={'center'}>
        {isEdit ? "Edit Your Band" : "Add Your Band"}
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Band Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
          helperText="Enter the name of your band - one at a time (You can submit multiple forms if you have more than one band)" // Helper text
        />
        <TextField
          label="Genre/Style"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          helperText="Just give people an idea of what the vibe is, doesn't have to be a strict genre" // Helper text
        />
        <TextField
          label="Contact Info"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          helperText="What's the best way to contact this band? Give us ONE way" // Helper text
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
          <FormHelperText>
            Select if your band is actively looking to play shows.
          </FormHelperText>
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
            <Typography
              variant="body1"
              sx={{ color: "black", display: "block", mt: 1 }}
            >
              Select all possible configurations this artist could perform in
            </Typography>
        </Box>
        <Typography variant="h6">Social Links</Typography>
        {Object.keys(formData.social_links).map((key) => (
          <TextField
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            name={key}
            value={formData.social_links[key]}
            onChange={(e) =>
              setFormData({
                ...formData,
                social_links: {
                  ...formData.social_links,
                  [key]: e.target.value,
                },
              })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
        ))}
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
            onChange={(e) => {
              handleFileChange(e);
              clearFileInput("photos"); // Clear file input after uploading
            }}
          />
        </Button>

     <Box
      sx={{
        display: "flex", // Arrange buttons in a row
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0, // Space between buttons
        mt: 0, // Margin on top of the buttons
        }}
     >
        {photoFiles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography>Uploaded Photos:</Typography>
            {photoFiles.map((file, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Uploaded Preview ${index}`}
                  style={{ width: 50, height: 50, borderRadius: "5px" }}
                />
                <IconButton
                  onClick={() => removePhoto(index)}
                  color="error"
                  size="small"
                >
                  <Close />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
          {/* Box for upload button + its resulting upload */}
        <Box sx={{ 
                mb: 2 ,
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                alignItems: "center",
               }}>
            <Button variant="contained" component="label" sx={{ mb: 2 }}> 
              Upload Stage Plot
              <input
                type="file"
                name="stage_plot"
                hidden
                accept=".pdf"
                onChange={handleFileChange}
              />
            </Button>
            {pdfFile && (
              // Box that contains "Uploaded Stage Plot: filename.pdf"
              <Box sx={{ 
                    mb: 2 ,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}>

                  <Typography fontStyle={"italic"}>{pdfFile.name}</Typography>
                  <IconButton
                    onClick={() => clearFileInput("stage_plot")}
                    color="error"
                    size="small"
                  >
                    <Close />
                  </IconButton>
              </Box>
            )}
          </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end", // Align button to the right
          mt: 4, // Add some spacing from the content above
        }}
      >
        <Button type="submit" variant="submit" color="primary">
          {isEdit ? "Update Band" : "Add Band"}
        </Button>
      </Box>
      </form>
    </Box>
  );
};

export default TCUPBandForm;