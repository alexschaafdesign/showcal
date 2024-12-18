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
import AppBreadcrumbs from "../components/Breadcrumbs";

const TCUPBandForm = ({ isEdit = false }) => {
  const { bandid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bandDataFromState = location.state?.band;

  const [formData, setFormData] = useState({
    name: bandDataFromState?.name || "",
    genre: bandDataFromState?.genre || ["", "", ""],
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
    profile_image: bandDataFromState?.profile_image || null,
    other_images: bandDataFromState?.other_images || [],
  });

  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const endpoint = "http://localhost:3001/api";
  const apiUrl = process.env.REACT_APP_API_URL;

  formData.genre = formData.genre || ["","",""];

  useEffect(() => {
    const canSubmit = formData.name.trim() !== "";
    setIsReadyToSubmit(canSubmit);
  }, [formData]);

  const handleGenreChange = (index, value) => {
    const updatedGenres = [...formData.genre];
    updatedGenres[index] = value;
    setFormData((prev) => ({ ...prev, genre: updatedGenres }));
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (file, preset) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dsll3ms2c/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url; // Cloudinary image URL
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  // Handle file selection and upload
  const handleImageChange = async (files, isProfileImage = false) => {
    if (files && files.length > 0) {
      const preset = isProfileImage
        ? "band_profile_image_upload" // Preset for profile image
        : "band_other_images_upload"; // Preset for other images

      if (isProfileImage) {
        // Limit to one profile image
        if (formData.profile_image) {
          alert("You can only upload one profile image. Remove the existing one first.");
          return;
        }
        const uploadedUrls = await Promise.all(
          Array.from(files).map((file) => uploadToCloudinary(file, preset))
        );

        setFormData((prev) => ({
          ...prev,
          profile_image: uploadedUrls[0], // Replace with the new profile image
        }));
      } else {
        // Limit other_images to 10
        if (formData.other_images.length >= 10) {
          alert("You can upload a maximum of 10 other images.");
          return;
        }

        const remainingSlots = 10 - formData.other_images.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        const uploadedUrls = await Promise.all(
          filesToUpload.map((file) => uploadToCloudinary(file, preset))
        );

        setFormData((prev) => ({
          ...prev,
          other_images: [...prev.other_images, ...uploadedUrls],
        }));
      }
    }
  };

  // Remove an image (profile or other)
  const handleRemoveImage = (index, isProfileImage = false) => {
    if (isProfileImage) {
      setFormData((prev) => ({ ...prev, profile_image: null }));
    } else {
      setFormData((prev) => ({
        ...prev,
        other_images: prev.other_images.filter((_, i) => i !== index),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchBand = async () => {
      if (!isEdit) return;
      try {
        let bandData;
  
        // Check if bandData is coming from state or fetch it from the API
        if (bandDataFromState) {
          bandData = bandDataFromState;
        } else {
          const response = await fetch(`${apiUrl}/tcupbands/${bandid}/edit`);
          const data = await response.json();
          bandData = data.data;
        }
  
        console.log("Fetched Band Data:", bandData);
  
        // Directly use Cloudinary URLs returned from the backend
        const profileImageUrl = bandData.profile_image || null; // Full Cloudinary URL
        const otherImageUrls = Array.isArray(bandData.other_images)
          ? bandData.other_images
          : []; // Array of Cloudinary URLs
  
        // Update the form data
        setFormData({
          name: bandData.name || "",
          genre: bandData.genre || ["", "", ""],
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
          profile_image: profileImageUrl, // Use Cloudinary URL directly
          other_images: otherImageUrls,   // Use Cloudinary URLs directly
        });
  
      } catch (error) {
        console.error("Error fetching band data:", error);
      }
    };
  
    fetchBand();
  }, [isEdit, bandid, bandDataFromState, apiUrl]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isReadyToSubmit) {
    console.log("Form not ready for submission.");
    return;
  }

  // Prepare the data as JSON
  const dataToSubmit = {
    name: formData.name,
    genre: formData.genre, // Already an array
    bandemail: formData.bandemail,
    play_shows: formData.play_shows,
    group_size: formData.group_size, // Already an array
    social_links: formData.social_links, // JSON
    music_links: formData.music_links,  // JSON
    profile_image: formData.profile_image, // Cloudinary URL
    other_images: formData.other_images,   // Array of Cloudinary URLs
  };

  try {
    const endpointURL = isEdit
      ? `${endpoint}/tcupbands/${bandid}/edit`
      : `${endpoint}/tcupbands/add`;

    const response = await fetch(endpointURL, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSubmit), // Send the entire formData as JSON
    });

    if (!response.ok) {
      throw new Error("Failed to submit band data");
    }

    const result = await response.json();
    console.log("Response from backend:", result);
    navigate("/tcupbands"); // Redirect after successful submission
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

      <form encType="multipart/form-data" onSubmit={handleSubmit}>
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
        {/* Profile Image Upload */}
        <Typography variant="h6">Profile Image</Typography>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files, true)}
          disabled={!!formData.profile_image} // Disable input if profile_image already exists
          aria-label="Upload a profile image"
        />

        {formData.profile_image && (
          <Box sx={{ mt: 2, position: "relative" }}>
            <img
              src={formData.profile_image}
              alt="Profile Preview"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ccc",
              }}
            />
            <Button
              onClick={() => handleRemoveImage(null, true)}
              variant="outlined"
              color="error"
              size="small"
              sx={{ position: "absolute", top: 0, right: 0 }}
            >
              Remove
            </Button>
          </Box>
        )}

       {/* Other Images Upload */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Other Images (Max 10)
        </Typography>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageChange(e.target.files, false)}
          disabled={formData.other_images.length >= 10} // Disable input if limit is reached
          aria-label="Upload additional images"
        />

        {formData.other_images.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            {formData.other_images.map((url, index) => (
              <Box key={index} sx={{ position: "relative" }}>
                <img
                  src={url}
                  alt={`Other Image ${index + 1}`}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #ccc",
                  }}
                />
                <Button
                  onClick={() => handleRemoveImage(index, false)}
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ position: "absolute", top: 0, right: 0 }}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
          disabled={!isReadyToSubmit}
        >
          {isEdit ? "Update Band" : "Add Band"}
        </Button>
      </form>
    </Box>
  );
};

export default TCUPBandForm;