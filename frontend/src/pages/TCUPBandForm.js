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
import { extractBandcampEmbedSrc, normalizeBandcampEmbedLink } from "../utils/formatBandcamp";

const TCUPBandForm = ({ isEdit = false }) => {
  const { bandid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bandDataFromState = location.state?.band;

  const [formData, setFormData] = useState({
    name: bandDataFromState?.name || "",
    genre: bandDataFromState?.genre || ["", "", ""], // Change this to an array for three genres
    bandemail: bandDataFromState?.bandemail || "",
    play_shows: bandDataFromState?.play_shows || "",
    group_size: bandDataFromState?.group_size || [],
    social_links: bandDataFromState?.social_links || {
      instagram: "",
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      website: "",
    },
    music_links: bandDataFromState?.music_links || {
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      youtube: "",
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
  
        // Use data from state if available, otherwise fetch from API
        if (bandDataFromState) {
          bandData = bandDataFromState;
        } else {
          const response = await fetch(`${endpoint}/tcupbands/${bandid}/edit`);
          const data = await response.json();
          bandData = data.data;
        }
  
        // Update formData with the fetched data
        setFormData({
          name: bandData.name || "",
          genre: bandData.genre || "",
          bandemail: bandData.bandemail || "",
          play_shows: bandData.play_shows || "",
          group_size: bandData.group_size || [],
          social_links: bandData.social_links || {
            instagram: "",
            spotify: "",
            bandcamp: "",
            soundcloud: "",
            website: "",
          },
          music_links: bandData.music_links || {
            spotify: "",
            bandcamp: "",
            soundcloud: "",
            youtube: "",
          },
        });
  
        // Preloaded images (ensure proper formatting for FilePond)
        const preloadedImages = bandData.images?.map((image) => ({
          source: image, // URL of the image
          options: { type: "local" }, // Indicates the image is preloaded
        }));
  
        // Update imageFiles state with preloaded images
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
  
  function validateLink(url, platform) {
    if (!url) return true; // Allow empty fields
  
    const regexes = {
      spotify: /^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/,
      bandcampSocial: /^(https?:\/\/)?([a-zA-Z0-9-]+\.bandcamp\.com)(\/.*)?$/,
      bandcampMusic: /<iframe[^>]*src="https:\/\/bandcamp\.com\/EmbeddedPlayer\/(album|track)=\d+[^"]*"|https:\/\/bandcamp\.com\/EmbeddedPlayer\/(album|track)=\d+/, // Match iframe or direct embed link
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    };
  
    return regexes[platform]?.test(url);
  }

  // HANDLE SUBMIT \\

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Only normalize and validate Bandcamp if it has a value
    const normalizedBandcampMusic = formData.music_links.bandcamp
      ? normalizeBandcampEmbedLink(formData.music_links.bandcamp)
      : null;
  
    // If Bandcamp music embed link exists but is invalid, show error
    if (formData.music_links.bandcamp && !normalizedBandcampMusic) {
      setErrorMessage(
        "Invalid Bandcamp embed code. Please paste the full iframe embed code or a valid embed link."
      );
      return;
    }
  
    // Prepare normalized data
    const updatedMusicLinks = {
      ...formData.music_links,
      bandcamp: normalizedBandcampMusic || formData.music_links.bandcamp, // Keep the existing value if unchanged
    };
  
    const dataToSubmit = new FormData();
  

    // Sanitize genre array
    const sanitizedGenres = formData.genre.filter((genre) => genre.trim() !== ""); // Remove empty genres

    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("genre", `{${sanitizedGenres.join(",")}}`); // Properly format array
    dataToSubmit.append("bandemail", formData.bandemail);
    dataToSubmit.append("play_shows", formData.play_shows);
    dataToSubmit.append("group_size", JSON.stringify(formData.group_size));
    dataToSubmit.append("social_links", JSON.stringify(formData.social_links));
    dataToSubmit.append("music_links", JSON.stringify(updatedMusicLinks));
  
    // Include preUploadedImages in the request
    const preUploadedImages = imageFiles
      .filter((file) => typeof file.source === "string") // Pre-existing files have `source` as a string
      .map((file) => file.source);
  
    if (preUploadedImages.length > 0) {
      dataToSubmit.append("preUploadedImages", JSON.stringify(preUploadedImages));
    }
  
    // Include newly uploaded files
    const newFiles = imageFiles.filter((file) => file.file); // Newly added files
    newFiles.forEach((file) => {
      dataToSubmit.append("images", file.file);
    });
  
    try {
      const endpointURL = isEdit
        ? `${endpoint}/tcupbands/${bandid}/edit`
        : `${endpoint}/tcupbands/add`;
  
      const response = await fetch(endpointURL, {
        method: isEdit ? "PUT" : "POST",
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
          label="Band Email"
          name="bandemail"
          value={formData.bandemail}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Add Spotify, Bandcamp, YouTube link fields */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Profile Links (to your overall artist profiles, not a specific album or song)
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
          label="Bandcamp Profile Link"
          name="bandcamp"
          value={formData.social_links.bandcamp || ""}
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
        <Typography variant="h6" sx={{ mb: 2 }}>
        Music Links (post the share link for an album or song!)
        </Typography>
        <TextField
          label="Spotify Album/Single Link"
          name="spotify"
          value={formData.music_links.spotify || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              music_links: {
                ...prev.music_links,
                spotify: e.target.value,
              },
            }))
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bandcamp Music Embed"
          name="bandcamp"
          value={formData.music_links.bandcamp || ""}
          fullWidth
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              music_links: {
                ...prev.music_links,
                bandcamp: e.target.value,
              },
            }))
          }
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