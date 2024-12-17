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


  // Update isReadyToSubmit whenever formData changes
  useEffect(() => {
    // If no images are required, then you can just allow submission if name or other required fields are filled.
    // For simplicity, let's remove the image requirement:
    const canSubmit = formData.name.trim() !== "";
    setIsReadyToSubmit(canSubmit);
  }, [formData]);

  const handleGenreChange = (index, value) => {
    const updatedGenres = [...formData.genre];
    updatedGenres[index] = value;
    setFormData((prev) => ({ ...prev, genre: updatedGenres }));
  };

  const handleImageChange = (files, isProfileImage = false) => {
    if (isProfileImage) {
      if (files[0] instanceof File) {
        // Just store the File object directly
        setFormData(prev => ({ ...prev, profile_image: files[0] }));
      } else {
        setFormData(prev => ({ ...prev, profile_image: files[0] }));
      }
    } else {
      // For other images, store the File objects directly as well
      setFormData(prev => ({ ...prev, other_images: files }));
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
        if (bandDataFromState) {
          bandData = bandDataFromState;
        } else {
          const response = await fetch(`${apiUrl}/tcupbands/${bandid}/edit`);
          const data = await response.json();
          bandData = data.data;
        }

        console.log("Band data profile_image before construction:", bandData.profile_image);
        console.log("Band data other_images before construction:", bandData.other_images);

        const baseApiUrl = process.env.REACT_APP_API_URL;
        const baseUrl = baseApiUrl.replace(/\/api$/, ''); // 'http://localhost:3001'


        // Construct image URLs from the base URL (no /api)
        const profileImageUrl = bandData.profile_image
          ? `${baseUrl}/assets/images/bands/${bandData.profile_image}`
          : null;

        const otherImageUrls =
          bandData.other_images?.map((imagePath) => `${baseUrl}/assets/images/bands/${imagePath}`) || [];

          console.log("Constructed profileImageUrl:", profileImageUrl);
          console.log("Constructed otherImageUrls:", otherImageUrls);

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
          profile_image: profileImageUrl, 
          other_images: otherImageUrls,
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
  
      const dataToSubmit = new FormData();
  
      // Append text fields
      dataToSubmit.append("name", formData.name);
      dataToSubmit.append("genre", JSON.stringify(formData.genre));
      dataToSubmit.append("bandemail", formData.bandemail);
      dataToSubmit.append("play_shows", formData.play_shows);
      dataToSubmit.append("group_size", JSON.stringify(formData.group_size));
      dataToSubmit.append("social_links", JSON.stringify(formData.social_links));
      dataToSubmit.append("music_links", JSON.stringify(formData.music_links));
  
      // Append profile_image if it's a file
      if (formData.profile_image instanceof File) {
        dataToSubmit.append("profile_image", formData.profile_image);
      }
  
      // Append other_images if they are files
      if (Array.isArray(formData.other_images) && formData.other_images.length > 0) {
        formData.other_images.forEach((file) => {
          if (file instanceof File) dataToSubmit.append("other_images", file);
        });
      }
  
      try {
        const endpointURL = isEdit
          ? `${endpoint}/tcupbands/${bandid}/edit`
          : `${endpoint}/tcupbands/add`;
  
        const response = await fetch(endpointURL, {
          method: isEdit ? "PUT" : "POST",
          body: dataToSubmit,
        });
  
        if (!response.ok) {
          const errorDetails = await response.text();
          console.log("Error details from API:", errorDetails);
          throw new Error("Failed to submit band data");
        }
  
        const result = await response.json();
        console.log("Response from backend:", result);
        navigate("/tcupbands");
      } catch (err) {
        console.error("Error submitting band data:", err);
        setErrorMessage("Failed to submit band data.");
      }
    };

    console.log("Final profile_image passed to FilePond:", formData.profile_image);
    console.log("Final other_images passed to FilePond:", formData.other_images);

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
        <CustomFilePond
          files={formData.profile_image 
            ? [{ source: formData.profile_image }] 
            : []}        
          setFiles={(files) => handleImageChange(files, true)}
          allowMultiple={false}
          maxFiles={1}
          name="profile_image"
        />

        {/* Other Images Upload */}
        <Typography variant="h6">Other Images</Typography>
        <CustomFilePond
          files={formData.other_images.map(url => ({ source: url }))} // no type: 'local'
          setFiles={(files) => handleImageChange(files, false)}
          allowMultiple={true}
          maxFiles={5}
          name="other_images"
        />

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