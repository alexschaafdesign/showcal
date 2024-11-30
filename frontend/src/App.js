import React from "react";
import { Route, Routes } from "react-router-dom";
import Calendar from "./pages/Calendar.js";
import Home from "./pages/Home.js";
import ShowsTable from "./pages/ShowsTable.js";
import BandsTable from "./pages/BandsTable.js";
import BandProfile from "./pages/BandProfile.js";
import "./styles/App.css";
import VenuesTable from "./pages/VenuesTable.js";
import VenueProfile from "./pages/VenueProfile.js";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TCUPBandForm from "./pages/TCUPBandForm.js";
import TCUPBandsTable from "./pages/TCUPBandsTable.js";
import TCUPBandProfile from "./pages/TCUPBandProfile.js";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          padding: {
            xs: 2, // padding of 16px for extra small screens
            sm: 3, // padding of 24px for small screens
            md: 4, // padding of 32px for medium screens
          },
          margin: 2,
        }}
      >
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Shows */}
          <Route path="/shows" element={<ShowsTable />} />

          {/* Bands */}
          <Route path="/bands" element={<BandsTable />} />
          <Route path="/bands/:id/view" element={<BandProfile />} />

          {/* TCUP Bands */}
          <Route path="/tcupbands" element={<TCUPBandsTable />} />
          <Route path="/tcupbands/add" element={<TCUPBandForm isEdit={false} />} />
          <Route path="/tcupbands/:bandid" element={<TCUPBandProfile />} />
          <Route path="/tcupbands/:bandid/edit" element={<TCUPBandForm isEdit={true} />} />

          {/* Venues */}
          <Route path="/venues" element={<VenuesTable />} />
          <Route path="/venues/:id" element={<VenueProfile />} />

          {/* Calendar */}
          <Route path="/calendar" element={<Calendar />} />

          {/* Catch-All */}
          <Route
            path="*"
            element={<div style={{ textAlign: "center", padding: "20px" }}>Page Not Found</div>}
          />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;