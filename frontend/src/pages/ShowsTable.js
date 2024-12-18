import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Checkbox, FormControlLabel, Box, TablePagination } from '@mui/material';
import ShowsTableCore from './ShowsTableCore';
import DynamicFilterComponent from '../components/DynamicFilterComponent';

function ShowsTable() {
  const [showsData, setShowsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [showTCUPBandsOnly, setShowTCUPBandsOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch(`${apiUrl}/shows`);
        if (!response.ok) throw new Error('Failed to fetch shows');
        const result = await response.json();
        setShowsData(result);
      } catch (err) {
        console.error('Error fetching shows:', err);
        setShowsData([]);
      }
    }; 

    fetchShows();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedVenue, showTCUPBandsOnly]);

  const filterEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
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
  
      const matchesDate = new Date(item.start) >= today;
  
      return matchesSearch && matchesVenue && matchesTCUP && matchesDate;
    });
  };

  const filteredData = filterEvents();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleShowClick = (showId) => {
    if (showId) {
      navigate(`/shows/${showId}`);
    } else {
      console.error("No show ID found");
    }
  };

  const filters = [
    {
      type: 'text',
      label: 'Search by venue or band name',
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value.toLowerCase()),
    },
    {
      type: 'dropdown',
      placeholder: 'Select Venue',
      value: selectedVenue,
      onChange: (e) => setSelectedVenue(e.target.value),
      options: [
        ...new Set(
          showsData
            .map((item) => item.venue_name?.trim()) // Deduplicate and clean
            .filter(Boolean) // Remove null or undefined values
        ),
      ]
        .sort()
        .map((venue) => ({
          label: venue.charAt(0).toUpperCase() + venue.slice(1), // Capitalized for display
          value: venue, // Actual value
        })),
    },
  ];

  console.log("Filtered and paginated data:", paginatedData);


  return (
    <Box sx={{ paddingBottom: '150px', paddingTop: 2, overflowY: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Shows
      </Typography>

      {/* Dynamic Filters */}
      <DynamicFilterComponent filters={filters} />

      <FormControlLabel
        control={
          <Checkbox
            checked={showTCUPBandsOnly}
            onChange={(e) => setShowTCUPBandsOnly(e.target.checked)}
          />
        }
        label="Show TCUP bands only"
        style={{ marginBottom: '8px' }}
      />

      <ShowsTableCore
        data={paginatedData}
        onShowClick={handleShowClick}
      />

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Box>
  );
}

export default ShowsTable;