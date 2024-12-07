import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CustomFilePond from "../components/CustomFilePond";

const TCUPBandForm = ({ isEdit = false }) => {
  const { bandid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bandDataFromState = location.state?.band;

  const [formData, setFormData] = useState({
    name: bandDataFromState?.name || "",
    genre: bandDataFromState?.genre || "",
    contact: bandDataFromState?.contact || "",
    play_shows: bandDataFromState?.play_shows || "",
    group_size: bandDataFromState?.group_size || [],
    social_links: bandDataFromState?.social_links || {
      instagram: "",
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      website: "",
    },
  });

  const [imageFiles, setImageFiles] = useState([]); // Handles images
  const [removedImages, setRemovedImages] = useState([]); // Tracks removed images
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const endpoint = "http://alexschaafdesign.com:3001";

  useEffect(() => {
    const fetchBand = async () => {
      if (isEdit && !bandDataFromState) {
        try {
          const response = await fetch(`${endpoint}/tcupbands/${bandid}/edit`);
          if (!response.ok) throw new Error("Failed to fetch band data");
          const data = await response.json();
  
          console.log("Fetched Band Data:", data);
  
          setFormData({
            name: data.data.name || "",
            genre: data.data.genre || "",
            contact: data.data.contact || "",
            play_shows: data.data.play_shows || "",
            group_size: data.data.group_size || [],
            social_links: data.data.social_links || {
              instagram: "",
              spotify: "",
              bandcamp: "",
              soundcloud: "",
              website: "",
            },
          });
  
          // Preload existing images into FilePond
          setImageFiles(
            (data.data.images || []).map((image) => ({
              source: image,
              options: { type: "local" },
            }))
          );
        } catch (error) {
          console.error("Error fetching band data:", error);
        }
      }
    };
  
    fetchBand();
  }, [isEdit, bandid, bandDataFromState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const preUploadedFiles = imageFiles
  .filter((file) => !file.file)
  .map((file) => file.source);

  // handleSubmit function

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const dataToSubmit = new FormData();
  
    // Append form data
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("genre", formData.genre);
    dataToSubmit.append("contact", formData.contact);
    dataToSubmit.append("play_shows", formData.play_shows);
    dataToSubmit.append("group_size", JSON.stringify(formData.group_size));
    dataToSubmit.append("social_links", JSON.stringify(formData.social_links));
  
    // Append pre-uploaded files (send as a single JSON string array)
    if (preUploadedFiles.length > 0) {
      dataToSubmit.append("preUploadedImages", JSON.stringify(preUploadedFiles));
    }
  
    // Append new files for upload
    imageFiles.forEach((fileObj) => {
      if (fileObj.file) {
        dataToSubmit.append("images", fileObj.file); // Use the `file` property only
      }
    });
  
    // Debugging: Log FormData entries
    for (let [key, value] of dataToSubmit.entries()) {
      console.log(key, value instanceof File ? value.name : value);
    }
  
    try {
      const endpointURL = isEdit
        ? `${endpoint}/tcupbands/${bandid}/edit` // Use PUT for edits
        : `${endpoint}/tcupbands/add`; // Use POST for adds
  
      const response = await fetch(endpointURL, {
        method: isEdit ? "PUT" : "POST",
        body: dataToSubmit,
      });
  
      if (!response.ok) throw new Error("Failed to submit band data");
  
      const successMessage = isEdit
        ? "Band updated successfully!"
        : "Band added successfully!";
  
      // Redirect on success
      window.scrollTo(0, 0); // Scroll to top on success
      navigate("/tcupbands", { state: { successMessage } });
    } catch (err) {
      console.error("Error submitting band data:", err);
      setErrorMessage("Failed to submit band data.");
    }
  };

  return (
    <Box sx={{ paddingTop: 2, paddingBottom: 10, paddingX: 4 }}>
      <Typography variant="h1" gutterBottom textAlign={"center"}>
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
        />
        <TextField
          label="Genre/Style"
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
          <Typography>Group Size</Typography>
          {["Solo", "Duo", "Trio", "4-piece", "5+ piece"].map((size) => (
            <FormControlLabel
              key={size}
              control={
                <Checkbox
                  checked={formData.group_size.includes(size)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      group_size: prev.group_size.includes(value)
                        ? prev.group_size.filter((s) => s !== value)
                        : [...prev.group_size, value],
                    }));
                  }}
                  value={size}
                />
              }
              label={size}
            />
          ))}
        </Box>

        {/* Images Section */}
        <Typography>Images</Typography>
        <CustomFilePond
        files={imageFiles}
        setFiles={setImageFiles}
        endpoint="http://alexschaafdesign.com:3001"
        name="images" // Must match the field name in Multer middleware
        allowMultiple={true}
        maxFiles={10}
      />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
        >
          {isEdit ? "Update Band" : "Add Band"}
        </Button>
      </form>
    </Box>
  );
};

export default TCUPBandForm;