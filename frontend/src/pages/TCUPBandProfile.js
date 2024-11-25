import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const TCUPBandProfile = () => {
  const { id } = useParams(); // Capture the ID from the URL (if applicable)

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Band Profile
      </Typography>
      <Typography variant="body1">
        This is the profile page for band ID: {id || 'No ID provided'}.
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 2 }}>
        Here you can display detailed information about the band, like their name, genre, photos, social links, group size, and stage plot.
      </Typography>
    </Box>
  );
};

export default TCUPBandProfile;