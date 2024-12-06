import React, { useState } from "react";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NavigationTabs from "./NavigationTabs"; // Import your NavigationTabs component

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: "Shows", path: "/shows" },
    { text: "Venues", path: "/venues" },
    { text: "Bands", path: "/tcupbands" },
    { text: "People", path: "/people" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "primary.main",
        display: "flex",
        flexDirection: "column",
        padding: "10px 20px",
        height: "120px",
        boxShadow: 4,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "20px",
          transform: "translateY(-50%)",
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

      {/* Tabs or Hamburger */}
      <Box
        sx={{
          marginTop: "auto",
          display: { xs: "none", md: "flex" }, // Hide tabs on small screens
          justifyContent: "center",
          width: "100%",
        }}
      >
        <NavigationTabs />
      </Box>

      {/* Hamburger Menu for Small Screens */}
      <IconButton
        sx={{
          display: { xs: "block", md: "none" }, // Show on small screens
          position: "absolute",
          top: "50%",
          right: "20px",
          transform: "translateY(-50%)",
          color: "white",
        }}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List>
          {navLinks.map((link, index) => (
            <ListItem button key={index} component="a" href={link.path}>
              <ListItemText primary={link.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Header;