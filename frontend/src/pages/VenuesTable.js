// src/pages/VenuesTable.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const VenuesTable = () => {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      const response = await fetch('http://localhost:3001/tcup?table=venues');
      const data = await response.json();
      setVenues(data);
    };
    fetchVenues();
  }, []);

  return (
    <div>
      <h1>Venues</h1>
      <table>
        <thead>
          <tr>
            <th>Venue</th>
            <th>Location</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => (
            <tr key={venue.venue}>
              <td>
                <Link to={`/venues/${encodeURIComponent(venue.venue)}`}>{venue.venue}</Link>
              </td>
              <td>{venue.location}</td>
              <td>{venue.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VenuesTable;