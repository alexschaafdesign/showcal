import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the active tab based on the current route
  const getActiveTab = () => {
    if (location.pathname.startsWith("/shows")) return 0;
    if (location.pathname.startsWith("/venues")) return 1;
    if (location.pathname.startsWith("/tcupbands")) return 2;
    if (location.pathname.startsWith("/people")) return 3;

    return false; // No tab selected
  };

  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/shows");
        break;
      case 1:
        navigate("/venues");
        break;
      case 2:
        navigate("/tcupbands");
        break;
      case 3:
        navigate("/people");
        break;
      default:
        break;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // Center align tabs horizontally
        alignItems: "center",
        padding: "0px 16px", // Adjust padding as needed
        margin: 0,
      }}
    >
      <Tabs
        value={getActiveTab()}
        onChange={handleTabChange}
        centered
      >
        <Tab
          label="Shows"
        />
        <Tab
          label="Venues"
        />
        <Tab
          label="Bands"
        />
        <Tab
          label="People"
        />
      </Tabs>
    </Box>
  );
};

export default NavigationTabs;