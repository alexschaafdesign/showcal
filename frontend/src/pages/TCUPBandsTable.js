import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom"; // For navigation and state
import formatBandData from "../utils/formatBandData";
import BandSocialLinks from "../components/BandSocialLinks";

const TCUPBandsTable = () => {
  const [bands, setBands] = useState([]);
  const [filteredBands, setFilteredBands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [playShowsFilter, setPlayShowsFilter] = useState("");
  const [bandSizeFilter, setBandSizeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  
  const handleAddBand = () => {
    navigate("/tcupbands/add"); // Redirect to the "Add Band" form page
  };

  useEffect(() => {
    const fetchBands = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3001/tcupbands");
        if (!response.ok) throw new Error("Failed to fetch bands");
        const data = await response.json();

        const formattedBands = data.data.map(formatBandData);
        setBands(formattedBands);
        setFilteredBands(formattedBands); // Initialize filtered bands
      } catch (error) {
        console.error("Error fetching bands:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBands();

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const applyFilters = () => {
    let filtered = bands;

    if (searchQuery) {
      filtered = filtered.filter((band) =>
        band.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (genreFilter) {
      filtered = filtered.filter(
        (band) =>
          Array.isArray(band.genre) &&
          band.genre.includes(genreFilter)
      );
    }

    if (playShowsFilter) {
      filtered = filtered.filter(
        (band) =>
          band.play_shows &&
          band.play_shows.toLowerCase() === playShowsFilter.toLowerCase()
      );
    }

    if (bandSizeFilter) {
      filtered = filtered.filter(
        (band) =>
          Array.isArray(band.group_size) &&
          band.group_size.includes(bandSizeFilter)
      );
    }

    setFilteredBands(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, genreFilter, playShowsFilter, bandSizeFilter]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ padding: 0 }}>
    {/* Display success message */}
    {successMessage && (
      <Alert severity="success" sx={{ mb: 2 }}>
        {successMessage}
      </Alert>
    )}
  
  <Box sx={{ padding: 3 }}>
      {/* Title and Add Band Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "left",
          alignItems: "center",
          gap: 2,
          marginBottom: 2,
        }}
      >
        <Button variant="contained" color="primary" onClick={handleAddBand}>
          Add Band
        </Button>
      </Box>
  
    {/* Search and Filters */}
    <TextField
      label="Search Band Name"
      value={searchQuery}
      onChange={handleSearch}
      variant="outlined"
      fullWidth
      sx={{ marginBottom: 2 }}
    />
  
    <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
      {/* Genre Filter */}
      <FormControl fullWidth>
        <InputLabel>Filter by Genre</InputLabel>
        <Select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <MenuItem value="">All Genres</MenuItem>
          {Array.from(new Set(bands.flatMap((band) => band.genre || []))).map(
            (genre) => (
              <MenuItem key={genre} value={genre}>
                {genre}
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>
  
      {/* Play Shows Filter */}
      <FormControl fullWidth>
        <InputLabel>Looking to Play Shows?</InputLabel>
        <Select
          value={playShowsFilter}
          onChange={(e) => setPlayShowsFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="yes">Yes</MenuItem>
          <MenuItem value="maybe">Maybe</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </Select>
      </FormControl>
  
      {/* Band Size Filter */}
      <FormControl fullWidth>
        <InputLabel>Filter by Band Size</InputLabel>
        <Select
          value={bandSizeFilter}
          onChange={(e) => setBandSizeFilter(e.target.value)}
        >
          <MenuItem value="">All Sizes</MenuItem>
          {Array.from(
            new Set(
              bands.flatMap((band) => band.group_size || []).filter(Boolean)
            )
          ).map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  
    <Paper elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Band Name</strong></TableCell>
            <TableCell><strong>Images</strong></TableCell>
            <TableCell><strong>Contact Info</strong></TableCell>
            <TableCell><strong>Social Links</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bands
            .filter((band) => {
              // Apply search filter
              if (searchQuery && !band.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
              }
  
              // Apply genre filter
              if (genreFilter && !(band.genre || []).includes(genreFilter)) {
                return false;
              }
  
              // Apply play shows filter
              if (playShowsFilter && band.play_shows !== playShowsFilter) {
                return false;
              }
  
              // Apply band size filter
              if (bandSizeFilter && !(band.group_size || []).includes(bandSizeFilter)) {
                return false;
              }
  
              return true; // Show if all filters pass
            })
            .map((band) => (
              <TableRow
                key={band.id}
                onClick={() => navigate(`/tcupbands/${band.id}`)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>{band.name}</TableCell>
                <TableCell>
                  {Array.isArray(band.images) && band.images.length > 0 ? (
                    band.images.map((image, index) => (
                      <img
                        key={index}
                        src={`http://localhost:3001${image}`}
                        alt={`Band ${index + 1}`}
                        style={{ width: 50, height: 50, marginRight: 5 }}
                      />
                    ))
                  ) : (
                    "No Images"
                  )}
                </TableCell>
                <TableCell>{band.contact || "No Contact Info"}</TableCell>
                <TableCell>
                <BandSocialLinks links={band.social_links} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Paper>
  </Box>
  </Box>
  );
};

export default TCUPBandsTable;