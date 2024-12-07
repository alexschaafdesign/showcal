
import React, { useEffect, useState } from "react";
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
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme"; // Import your custom theme
import TCUPBandForm from "./pages/TCUPBandForm.js";
import TCUPBandsTable from "./pages/TCUPBandsTable.js";
import TCUPBandProfile from "./pages/TCUPBandProfile.js";
import Header from "./components/Header.js"; // Import your custom Header component
import TCUPPeopleForm from "./pages/TCUPPeopleForm.js";
import TCUPPeopleTable from "./pages/TCUPPeopleTable.js";
import TCUPPeopleProfile from "./pages/TCUPPeopleProfile.js";
import Organize from "./pages/Organize.js";

function App() {
  const [allShows, setAllShows] = useState([]);

  // Fetch all shows from the backend
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch("https://alexschaafdesign.com/api/shows");
        if (!response.ok) throw new Error("Failed to fetch shows");
        const data = await response.json();
        setAllShows(data); // Save shows data in state
      } catch (error) {
        console.error("Error fetching shows:", error);
      }
    };

    fetchShows();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {/* Include Header above the Routes */}
      <Header />
      <Box
        sx={{
          paddingTop: {
            xs: 0, // padding of 16px for extra small screens
            sm: 0, // padding of 24px for small screens
            md: 0, // padding of 32px for medium screens
          },
          paddingX: {
            xs: 1, // padding of 16px for extra small screens
            sm: 3, // padding of 24px for small screens
            md: 4, // padding of 32px for medium screens
          },
          marginX: {
            xs: 2, // Horizontal margin of 16px for extra small screens
            sm: 4, // Horizontal margin of 32px for small screens
            md: 20, // Horizontal margin of 48px for medium and larger screens
          },
        }}
      >
        <Routes>
          {/* Home */}
          <Route path="/" element={<ShowsTable />} />

          {/* Organize */}
          <Route path="/organize" element={<Organize />} />

          {/* Shows */}
          <Route path="/shows" element={<ShowsTable allShows={allShows} />} />

          {/* Bands */}
          <Route path="/bands" element={<BandsTable />} />
          <Route path="/bands/:id/view" element={<BandProfile />} />

          {/* TCUP Bands */}
          <Route path="/tcupbands" element={<TCUPBandsTable />} />
          <Route path="/tcupbands/add" element={<TCUPBandForm isEdit={false} />} />
          <Route
            path="/tcupbands/:bandid"
            element={<TCUPBandProfile allShows={allShows} />}
          />
          <Route path="/tcupbands/:bandid/edit" element={<TCUPBandForm isEdit={true} />} />

          {/* Venues */}
          <Route path="/venues" element={<VenuesTable />} />
          <Route path="/venues/:id" element={<VenueProfile />} />

          {/* People */}
          <Route path="/people/add" element={<TCUPPeopleForm />} />
          <Route
            path="/people/:personId/edit"
            element={<TCUPPeopleForm isEdit />}
          />
          <Route 
            path="/people/:personID"
            element={<TCUPPeopleProfile />}
          />
          <Route path="/people" element={<TCUPPeopleTable />} />

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