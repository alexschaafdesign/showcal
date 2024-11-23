import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel } from '@mui/material';

const BandForm = () => {
  const { id } = useParams(); // Get the band ID from the URL
  const navigate = useNavigate();

  // State for form fields
  const [band, setBand] = useState('');
  const [socialLinks, setSocialLinks] = useState({ instagram: '', website: '' });
  const [genre, setGenre] = useState('');
  const [contact, setContact] = useState('');
  const [openToRequests, setOpenToRequests] = useState(false);
  const [bandSize, setBandSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // State for success/error messages

  useEffect(() => {
    if (id) {
      // Fetch band data for editing
      const fetchBand = async () => {
        try {
          const response = await fetch(`http://localhost:3001/tcup/bands/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch band data');
          }
          const data = await response.json();

          // Populate form fields with fetched data
          setBand(data.band || '');
          setSocialLinks(data.social_links || { instagram: '', website: '' });
          setGenre(data.genre || '');
          setContact(data.contact || '');
          setOpenToRequests(data.open_to_requests || false);
          setBandSize(data.band_size || '');
        } catch (err) {
          console.error('Error fetching band data:', err);
          setError('Failed to load band data.');
        } finally {
          setLoading(false);
        }
      };

      fetchBand();
    } else {
      setLoading(false); // For adding a new band
    }
  }, [id]);

  const handleSocialLinksChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks((prevLinks) => ({
      ...prevLinks,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const updatedBandData = {
      band,
      social_links: socialLinks,
      genre,
      contact,
      open_to_requests: openToRequests, // Ensure this matches your backend field name
      band_size: bandSize, // Ensure this matches your backend field name
    };
  
    try {
      const response = await fetch(`http://localhost:3001/tcup/bands/${id ? `${id}/edit` : 'add-band'}`, {
        method: id ? 'PUT' : 'POST', // PUT for editing, POST for adding
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBandData),
      });
  
      if (response.ok) {
        const successMessage = id ? 'Band updated successfully!' : 'Band added successfully!';
        navigate('/bands', { state: { successMessage } }); // Pass success message
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to save band.');
      }
    } catch (error) {
      console.error('Error saving band:', error);
      setMessage('Error saving band.');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Band' : 'Add Band'}
      </Typography>
      {message && <Typography color="error">{message}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          label="Band Name"
          value={band}
          onChange={(e) => setBand(e.target.value)}
          placeholder="Enter the band name"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          variant="outlined"
          label="Instagram Username"
          name="instagram"
          value={socialLinks.instagram}
          onChange={handleSocialLinksChange}
          placeholder="Enter Instagram username"
          fullWidth
          margin="normal"
        />
        <TextField
          variant="outlined"
          label="Website"
          name="website"
          value={socialLinks.website}
          onChange={handleSocialLinksChange}
          placeholder="Enter website (e.g., bandsite.com)"
          fullWidth
          margin="normal"
        />
        <TextField
          variant="outlined"
          label="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Enter the band's genre"
          fullWidth
          margin="normal"
        />
        <TextField
          variant="outlined"
          label="Contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Enter contact info"
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={openToRequests}
              onChange={(e) => setOpenToRequests(e.target.checked)}
            />
          }
          label="Open to Show Requests?"
        />
        <TextField
          variant="outlined"
          label="Band Size"
          value={bandSize}
          onChange={(e) => setBandSize(e.target.value)}
          placeholder="Enter the band's size options"
          fullWidth
          margin="normal"
        />
        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
            {id ? 'Save Changes' : 'Add Band'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/bands')}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default BandForm;