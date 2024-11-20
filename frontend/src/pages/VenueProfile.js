// src/pages/VenueProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VenueProfile = () => {
  const { venueName } = useParams(); // Get the venue name from the URL
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcup/venues/${encodeURIComponent(venueName)}`);
        if (response.ok) {
          const data = await response.json();
          setVenue(data);
          setLoading(false); // Add this line to stop showing "Loading..."
        } else {
          setError("Venue Not Found");
          setLoading(false); // Add this line to stop showing "Loading..." if there's an error
        }
      } catch (error) {
        setError("An error occurred while fetching the venue data.");
        setLoading(false);
      }
    };
    fetchVenue();
  }, [venueName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{venue.venue}</h1>
      <p>Location: {venue.location}</p>
      <p>Capacity: {venue.capacity}</p>
      {/* Add more venue details as needed */}
    </div>
  );
};

export default VenueProfile;