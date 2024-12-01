import React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import BandSocialLinks from "./BandSocialLinks";


const ProfilePhotoCard = ({ name, imageUrl, genre, onEdit, socialLinks }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        boxShadow: 1,
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      {/* Profile Photo */}
      <Box
        component="img"
        src={imageUrl}
        alt={`${name}'s profile`}
        sx={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: 2,
        }}
      />

      {/* Name */}
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          textTransform: "uppercase",
          fontWeight: "bold",
          marginBottom: 1,
        }}
      >
        {name}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          textTransform: "uppercase",
          fontWeight: "bold",
          marginBottom: 1,
        }}
      >
        {genre}
      </Typography>

      {/* Edit Button */}
      <Button variant="text" onClick={onEdit}>
        Edit Band
      </Button>

      {/* Social Links */}
      {socialLinks && <BandSocialLinks links={socialLinks} />} 

    </Box>
  );
};

export default ProfilePhotoCard;