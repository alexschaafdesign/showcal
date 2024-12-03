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
import AppBreadcrumbs from "../components/Breadcrumbs";

const TCUPBandForm = ({ isEdit = false }) => {
  const { bandid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bandDataFromState = location.state?.band;

  const [formData, setFormData] = useState({
    name: bandDataFromState?.name || "",
  genre: bandDataFromState?.genre || ["", "", ""], // Change this to an array for three genres
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

  const handleGenreChange = (index, value) => {
    const updatedGenres = [...formData.genre];
    updatedGenres[index] = value; // Update the specific genre at the given index
    setFormData((prev) => ({ ...prev, genre: updatedGenres }));
  };

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
  
  function validateSpotifyLink(url) {
    const regex = /^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/;
    return regex.test(url);
  }
  
  function validateBandcampLink(url) {
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.bandcamp\.com)(\/.*)?$/;
    return regex.test(url);
  }
  
  function validateYouTubeLink(url) {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return regex.test(url);
  }

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


    // Format social links
    if (formData.social_links.spotify && !validateSpotifyLink(formData.social_links.spotify)) {
      setErrorMessage("Invalid Spotify link.");
      return;
    }
    if (formData.social_links.bandcamp && !validateBandcampLink(formData.social_links.bandcamp)) {
      setErrorMessage("Invalid Bandcamp link.");
      return;
    }
    if (formData.social_links.youtube && !validateYouTubeLink(formData.social_links.youtube)) {
      setErrorMessage("Invalid YouTube link.");
      return;
    }

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
      <AppBreadcrumbs />
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
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Genre/Style
        </Typography>
        {[0, 1, 2].map((index) => (
          <TextField
            key={index}
            label={`Genre ${index + 1}`}
            value={formData.genre[index] || ""}
            onChange={(e) => handleGenreChange(index, e.target.value)}
            fullWidth
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
        <TextField
          label="Contact Info"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Add Spotify, Bandcamp, YouTube link fields */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Media Links
        </Typography>
        <TextField
          label="Spotify Arist Profile Link"
          name="spotify"
          value={formData.social_links.spotify}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              social_links: {
                ...prev.social_links,
                spotify: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bandcamp Link"
          name="bandcamp"
          value={formData.social_links.bandcamp}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              social_links: {
                ...prev.social_links,
                bandcamp: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="YouTube Profile Link"
          name="youtube"
          value={formData.social_links.youtube || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              social_links: {
                ...prev.social_links,
                youtube: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <Typography variant="h3" sx={{ mb: 2 }}>
         Social Media        </Typography>
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