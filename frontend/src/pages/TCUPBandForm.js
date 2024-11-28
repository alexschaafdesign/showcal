import React, { useState, useEffect } from "react";
import {
  Box,
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
  const [pdfFile, setPdfFile] = useState(null); // Add this state to manage stage plot file
  const [stagePlotFile, setStagePlotFile] = useState([]);
  const [removedImages, setRemovedImages] = useState([]); // Tracks removed images
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const endpoint = "http://localhost:3001"; // Adjust for your backend URL


  useEffect(() => {
    const fetchBand = async () => {
      if (isEdit && !bandDataFromState) {
        try {
          const response = await fetch(`${endpoint}/tcupbands/${bandid}`);
          if (!response.ok) throw new Error("Failed to fetch band data");
          const data = await response.json();
  
          console.log("Fetched Band Data:", data);
  
          setFormData({
            ...formData,
            name: data.data.name || "",
            genre: data.data.genre || "",
            contact: data.data.contact || "",
            play_shows: data.data.play_shows || "",
            group_size: data.data.group_size || [],
            social_links: data.data.social_links || {},
          });
  
          // Populate imageFiles for FilePond
          setImageFiles(
            data.data.images.map((image) => ({
              source: image, // The existing file path
              options: {
                type: "local", // Tells FilePond it's a preloaded file
              },
            }))
          );
  
          if (data.data.stage_plot) {
            setPdfFile({
              source: data.data.stage_plot,
              options: { type: "local" },
            });
          }
        } catch (error) {
          console.error("Error fetching band data:", error);
        }
      }
    };
  
    fetchBand();
  }, [isEdit, bandid, bandDataFromState]);;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.name.trim()) {
      setErrorMessage("Band name is required.");
      return;
    }
  
    try {
      const url = isEdit
        ? `http://localhost:3001/tcupbands/${bandid}/edit`
        : "http://localhost:3001/tcupbands/add";
  
      const method = isEdit ? "PUT" : "POST";
  
      const dataToSubmit = new FormData();
      dataToSubmit.append("name", formData.name);
      dataToSubmit.append("genre", formData.genre);
      dataToSubmit.append("play_shows", formData.play_shows);
      dataToSubmit.append("contact", formData.contact);
      dataToSubmit.append("group_size", JSON.stringify(formData.group_size));
      dataToSubmit.append("social_links", JSON.stringify(formData.social_links));
  
      imageFiles.forEach((file) => {
        if (file.file) {
          // Append only new files
          dataToSubmit.append("images", file.file);
        }
      });
      if (stagePlotFile[0] && stagePlotFile[0].file) {
        dataToSubmit.append("stage_plot", stagePlotFile[0].file);
      }

      console.log("FormData to Submit:");
      for (let pair of dataToSubmit.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
  
      const response = await fetch(url, { method, body: dataToSubmit });
  
      if (!response.ok) throw new Error("Failed to submit band data");
  
      const successMessage = isEdit
        ? "Band updated successfully!"
        : "Band added successfully!";
      
      // Redirect to TCUPBandsTable with success message
      window.scrollTo(0, 0); // Scroll to the top of the page
      navigate("/tcupbands", { state: { successMessage } });
    } catch (err) {
      console.error("Error submitting band data:", err);
      setErrorMessage("Failed to submit band data.");
    }
  };

  console.log("FormData State:", formData); // Log current formData state
  console.log("Image Files State:", imageFiles); // Log current imageFiles state

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
          <Select name="play_shows" value={formData.play_shows} onChange={handleChange}>
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
          endpoint="http://localhost:3001"
          allowMultiple={true}
          maxFiles={10}
          name="images" // Change name to 'images'
        />

        {/* Stage Plot Section */}
        <Typography sx={{ mt: 4 }}>Stage Plot</Typography>
        <CustomFilePond
          files={stagePlotFile}
          setFiles={setStagePlotFile}
          endpoint="http://localhost:3001"
          allowMultiple={true}
          acceptedFileTypes={["application/pdf"]}
          name="stage_plot"
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 4 }}>
          {isEdit ? "Update Band" : "Add Band"}
        </Button>
      </form>
    </Box>
  );
};

export default TCUPBandForm;