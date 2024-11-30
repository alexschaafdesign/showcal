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

  const [imageFiles, setImageFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const endpoint = "http://localhost:3001";

  useEffect(() => {
    const fetchBand = async () => {
      if (!isEdit) return;
  
      try {
        let bandData;
  
        if (bandDataFromState) {
          bandData = bandDataFromState;
        } else {
          const response = await fetch(`${endpoint}/tcupbands/${bandid}/edit`);
          const data = await response.json();
          bandData = data.data;
        }
  
        setFormData({
          name: bandData.name || "",
          genre: bandData.genre || "",
          contact: bandData.contact || "",
          play_shows: bandData.play_shows || "",
          group_size: bandData.group_size || [],
          social_links: bandData.social_links || {
            instagram: "",
            spotify: "",
            bandcamp: "",
            soundcloud: "",
            website: "",
          },
        });
  
        // Format preloaded images
        const preloadedImages = bandData.images?.map((image) => ({
          source: image,
          options: { type: "local" }, // Maintain local type
        }));
  
        setImageFiles(preloadedImages || []);
      } catch (error) {
        console.error("Error fetching band data:", error);
      }
    };
  
    fetchBand();
  }, [isEdit, bandid, bandDataFromState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // HANDLE SUBMIT

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSubmit = new FormData();

    // Add form data
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("genre", formData.genre);
    dataToSubmit.append("contact", formData.contact);
    dataToSubmit.append("play_shows", formData.play_shows);
    dataToSubmit.append("group_size", JSON.stringify(formData.group_size));
    dataToSubmit.append("social_links", JSON.stringify(formData.social_links));

    // Separate preloaded and new files
    const preUploadedImages = imageFiles
    .filter((file) => file.source && typeof file.source === "string") // Only files with a `source` string are preloaded
    .map((file) => file.source);

    const newFiles = imageFiles.filter((file) => file.file); // Newly added files

    // Append preUploadedImages as JSON
    if (preUploadedImages.length > 0) {
      dataToSubmit.append("preUploadedImages", JSON.stringify(preUploadedImages));
    }

    // Append new uploads
    newFiles.forEach((fileObj) => {
      dataToSubmit.append("images", fileObj.file);
    });

    console.log("Submitting preUploadedImages:", preUploadedImages);
    console.log("Submitting new files:", newFiles);

    try {
      const endpointURL = isEdit
        ? `${endpoint}/tcupbands/${bandid}/edit`
        : `${endpoint}/tcupbands/add`;

      const method = isEdit ? "PUT" : "POST";

      console.log("Submitting to:", endpointURL, "Method:", method);

      const response = await fetch(endpointURL, {
        method: method,
        body: dataToSubmit,
      });

      if (!response.ok) throw new Error("Failed to submit band data");

      const result = await response.json();
      console.log("Response from backend:", result);

      navigate("/tcupbands");
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

        <Typography>Images</Typography>
        <CustomFilePond
          files={imageFiles}
          setFiles={setImageFiles}
          endpoint={endpoint}
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