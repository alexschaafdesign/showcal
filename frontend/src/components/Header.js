import React from "react";
import { Box } from "@mui/material";
import NavigationTabs from "./NavigationTabs";

const Header = () => {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main", // Purple background
        display: "flex",
        flexDirection: "column", // Stack logo and tabs vertically
        alignItems: "center", // Center items horizontally
        padding: "10px 20px",
        position: "relative", // Position for absolute placement
        height: "120px", // Adjust header height as needed
        boxShadow: 4,
      }}
    >
      {/* Logo on the left */}
      <Box
        sx={{
          position: "absolute", // Place the logo absolutely
          top: "50%", // Center vertically in the header
          left: "20px", // Adjust spacing from the left edge
          transform: "translateY(-50%)", // Align center vertically
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src={`${process.env.PUBLIC_URL}/assets/icons/tcuplogo.png`}
          alt="TCUP Logo"
          sx={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Navigation Tabs */}
      <Box
        sx={{
          marginTop: "auto", // Push to the bottom of the header
          display: "flex",
          justifyContent: "center", // Center tabs horizontally
          width: "100%", // Full width
        }}
      >
        <NavigationTabs />
      </Box>
    </Box>
  );
};

export default Header;