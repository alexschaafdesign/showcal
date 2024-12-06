import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faYoutube, faSpotify, faBandcamp } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import ShowsTableCore from './ShowsTableCore'; // Import the reusable ShowsTableCore

function BandProfile() {
  const { id } = useParams(); // Use "id" to match the route parameter
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bandData, setBandData] = useState(null);
  const [error, setError] = useState(null);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const fetchBandData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcup/bands/${id}`);
        if (!response.ok) throw new Error('Failed to fetch band data');
        const data = await response.json();
        setBandData(data.band || {}); // Adjust to match backend response structure
        setShows(data.shows || []);  // Shows are now included in the band API response
      } catch (error) {
        console.error('Error fetching band data:', error);
        setError('An error occurred while fetching the band data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBandData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/bands/${bandData.id}/edit`);
  };

  // Map platform names to FontAwesome icons
  const socialIconMap = {
    facebook: faFacebook,
    twitter: faTwitter,
    instagram: faInstagram,
    youtube: faYoutube,
    spotify: faSpotify,
    bandcamp: faBandcamp,
    website: faGlobe, // Use 'website' as a fallback key for generic links
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!bandData) return <Typography>Band data not found</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      {/* Band Name */}
      <Typography variant="h4" gutterBottom>
        {bandData.band}
      </Typography>

      {/* Edit Button */}
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" color="primary" onClick={handleEdit}>
          Edit Band
        </Button>
      </Box>

      {/* Social Links */}
      {bandData.social_links && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Social Links
          </Typography>
          <Paper elevation={2} sx={{ padding: 2 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.entries(bandData.social_links).map(([platform, url], index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <FontAwesomeIcon 
                    icon={socialIconMap[platform.toLowerCase()] || faGlobe} 
                    style={{ marginRight: '8px', fontSize: '1.2rem' }} 
                  />
                  <Typography variant="body1">
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  </Typography>
                </li>
              ))}
            </ul>
          </Paper>
        </Box>
      )}

      {/* Shows Table */}
      {shows.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Past and Future Shows
          </Typography>
          <ShowsTableCore
            data={shows} // Pass the shows data
            onBandClick={() => {}} // No band clicks on band profile
            onVenueClick={(venueId) => navigate(`/venues/${venueId}/view`)} // Navigate to the venue's profile
          />
        </Box>
      )}
    </Box>
  );
}

export default BandProfile;