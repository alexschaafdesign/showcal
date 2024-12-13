import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  TablePagination,  // Import TablePagination
} from '@mui/material';
import ShowsTableCore from './ShowsTableCore';

function ShowsTable() {
  const [showsData, setShowsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [showTCUPBandsOnly, setShowTCUPBandsOnly] = useState(false);
  const [page, setPage] = useState(0);  // Track the current page
  const [rowsPerPage, setRowsPerPage] = useState(20);  // Set default to 20 rows per page
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;  // The backend API URL from the .env file

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch(`${apiUrl}/shows`);
        if (!response.ok) throw new Error('Failed to fetch shows');
        const result = await response.json();
        setShowsData(result);
        console.log("Fetched data structure:", result);  // Log to inspect data structure
      } catch (err) {
        console.error('Error fetching shows:', err);
        setShowsData([]);
      }
    };
  
    fetchShows();
  }, []);

  // Reset to page 1 whenever any filter/search term is updated
  useEffect(() => {
    setPage(0); // Reset the page to 0 (which corresponds to the first page)
  }, [searchTerm, selectedVenue, showTCUPBandsOnly]);

  // Combined filtering logic
  const filterEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set the date to midnight for comparison

    // Log state variables to see their values
    console.log("searchTerm:", searchTerm);
    console.log("selectedVenue:", selectedVenue);
    console.log("showTCUPBandsOnly:", showTCUPBandsOnly);
  
    // If no filters are applied, return all data
    if (!searchTerm && !selectedVenue && !showTCUPBandsOnly) {
      console.log("No filters, returning all data");
      return showsData.filter(item => new Date(item.start) >= today); // Filter by date here
    }
  
    // If filters are applied, proceed with filtering
    return showsData.filter((item) => {
      const matchesSearch = searchTerm
        ? item.venue_name.toLowerCase().includes(searchTerm) ||
          (item.bands && item.bands.some((band) => band.name.toLowerCase().includes(searchTerm)))
        : true;
  
      const matchesVenue = selectedVenue
        ? item.venue_name.toLowerCase() === selectedVenue.toLowerCase()
        : true;
  
      const matchesTCUP = showTCUPBandsOnly
        ? item.bands && item.bands.some((band) => band.id)
        : true;
  
      const matchesDate = new Date(item.start) >= today; // Ensure event is from today onwards
  
      return matchesSearch && matchesVenue && matchesTCUP && matchesDate;
    });
  };

  const filteredData = filterEvents();
  console.log("Filtered data:", filteredData); // Log filtered data to see if it's correct

  // Handle page change in pagination
  const handleChangePage = (event, newPage) => {
    if (newPage * rowsPerPage >= filteredData.length && newPage > 0) {
      setPage(newPage - 1); // Prevent going to a page that doesn't exist
    } else {
      setPage(newPage);
    }

      // Scroll to the top of the page when the page changes
      window.scrollTo(0, 0);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);  // Reset page when rows per page change
  };

  // Slice the filtered data to paginate
  const paginatedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  console.log("Paginated data:", paginatedData);  // Ensure this is correctly populated
  
  // If this is empty, it means the filter logic has excluded all rows, or the pagination is misbehaving

  return (
    <Box sx={{ paddingBottom: '150px', paddingTop: 2, overflowY: 'auto' }}>
      <Typography variant="h2" gutterBottom textAlign="center">
        TWIN CITIES SHOW LIST
      </Typography>

      {/* Show TCUP Bands Only Filter */}
      <FormControlLabel
        control={
          <Checkbox
            checked={showTCUPBandsOnly}
            onChange={(e) => setShowTCUPBandsOnly(e.target.checked)}
          />
        }
        label="Show TCUP bands only"
        style={{ marginBottom: '16px' }}
      />

      {/* Search Field */}
      <TextField
        id="outlined-search"
        label="Search by venue or band name"
        type="search"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
      />

      {/* Venue Selector */}
      <Select
        value={selectedVenue}
        onChange={(e) => setSelectedVenue(e.target.value)}
        displayEmpty
        fullWidth
        style={{ marginBottom: '20px' }}
      >
        <MenuItem value="">All Venues</MenuItem>
        {[...new Set(showsData.map((item) => item.venue_name))].map((venue, index) => (
          <MenuItem key={index} value={venue}>
            {venue}
          </MenuItem>
        ))}
      </Select>

      {/* Table Core Component */}
      <ShowsTableCore
        data={paginatedData}  // Use paginated data
        onBandClick={(id) => id && navigate(`/tcupbands/${id}`)} // Navigate to band page if ID exists
        onVenueClick={(id) => navigate(`/venues/${id}`)} // Navigate to venue page
      />

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredData.length}  // Total number of filtered items
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}  // Option to select 5, 10, or 20 rows per page
      />
    </Box>
  );
}

export default ShowsTable;