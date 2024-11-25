import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
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
  Alert, // Import Alert for showing success message
} from "@mui/material";

const TCUPBandsTable = () => {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Access location to retrieve state
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchBands = async () => {
      try {
        const response = await fetch("http://localhost:3001/tcup?table=tcupbands");
        if (!response.ok) throw new Error("Failed to fetch bands");
        const data = await response.json();
        setBands(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBands();

    // Check for success message in location state
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);

      // Clear the message after 3 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [location.state]);

  const handleAddBand = () => {
    navigate("/tcupbands/add");
  };

  const handleEditBand = (band) => {
    navigate(`/tcupbands/${band.id}/edit`, { state: { band } });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        TCUP Bands
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddBand}
        sx={{ marginBottom: 2 }}
      >
        Add a Band
      </Button>
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Band Name</strong></TableCell>
              <TableCell><strong>Photos</strong></TableCell>
              <TableCell><strong>Social Links</strong></TableCell>
              <TableCell><strong>Genre</strong></TableCell>
              <TableCell><strong>Contact Info</strong></TableCell>
              <TableCell><strong>Looking to Play Shows?</strong></TableCell>
              <TableCell><strong>Group Size</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bands.map((band) => (
              <TableRow key={band.id}>
                <TableCell>{band.name}</TableCell>
                <TableCell>
                  {band.photos && band.photos.length > 0 ? (
                    band.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={`http://localhost:3001${photo}`} // Prepend the server URL
                        alt={`Band Photo ${index + 1}`}
                        style={{ width: 50, height: 50, marginRight: 5 }}
                      />
                    ))
                  ) : (
                    'No Photos'
                  )}
                </TableCell>
                <TableCell>
                  {band.social_links && (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {band.social_links.instagram && (
                        <li>
                          <a
                            href={`https://instagram.com/${band.social_links.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Instagram
                          </a>
                        </li>
                      )}
                      {band.social_links.spotify && (
                        <li>
                          <a
                            href={band.social_links.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Spotify
                          </a>
                        </li>
                      )}
                      {band.social_links.bandcamp && (
                        <li>
                          <a
                            href={band.social_links.bandcamp}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Bandcamp
                          </a>
                        </li>
                      )}
                      {band.social_links.soundcloud && (
                        <li>
                          <a
                            href={band.social_links.soundcloud}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            SoundCloud
                          </a>
                        </li>
                      )}
                      {band.social_links.website && (
                        <li>
                          <a
                            href={band.social_links.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Website
                          </a>
                        </li>
                      )}
                    </ul>
                  )}
                </TableCell>
                <TableCell>{band.genre || "No Genre"}</TableCell>
                <TableCell>{band.contact || "No Contact Info"}</TableCell>
                <TableCell>{band.play_shows || "No Preference"}</TableCell>
                <TableCell>
                  {band.group_size && band.group_size.length > 0
                    ? band.group_size.join(", ")
                    : "No Group Size"}
                </TableCell>
                <TableCell>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleEditBand(band)} // Pass the band object
                >
                  Edit
                </Button>
              </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TCUPBandsTable;