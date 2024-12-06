
import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import BandSocialLinks from "./BandSocialLinks";

const ProfilePhotoCard = ({ name, imageUrl, location, genre, onEdit, socialLinks }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: 3,
        boxShadow: 1,
        borderRadius: 2,
        backgroundColor: "background.paper",
        gap: 2,
      }}
    >
      {/* Profile Photo */}
      <Box
        component="img"
        src={imageUrl}
        alt={`${name}'s profile`}
        sx={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          objectFit: "cover",
          backgroundColor: "grey.300",
        }}
      />

      {/* Band Information */}
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Band Name */}
        <Typography
          variant="h5"
          sx={{
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          {name}
        </Typography>

        {/* Location */}
        <Typography variant="body2" sx={{ color: "text.secondary", marginBottom: 1 }}>
          {location || "Location"}
        </Typography>

        {/* Genre */}
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          {genre ? genre.join(" • ") : "GENRE • GENRE • GENRE"}
        </Typography>

        {/* Social Links */}
        {socialLinks && (
          <BandSocialLinks
            links={socialLinks}
            sx={{ marginBottom: 1 }}
          />
        )}

        {/* Favorite/Action Buttons */}
        <Button variant="contained" onClick={onEdit} sx={{ padding: 0 }}>
          Add as favorite
        </Button>
      </Box>
    </Box>
  );
};

export default ProfilePhotoCard;
