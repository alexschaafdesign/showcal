import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

function ShowsTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/tcup?table=shows')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched show data:", data); // Debug log for fetched data
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setData([]);
        }
      })
      .catch(error => console.error("Error fetching show data:", error));
  }, []);

  const filterFutureEvents = (data) => {
    const today = new Date();
    return data.filter(item => item.start && new Date(item.start) >= today);
  };

  const groupByDate = (data) => {
    const filteredData = filterFutureEvents(data);
    const grouped = {};
    filteredData.forEach(item => {
      if (item.start) {
        const showDate = new Date(item.start).toLocaleDateString();
        if (!grouped[showDate]) {
          grouped[showDate] = [];
        }
        grouped[showDate].push(item);
      }
    });
    return grouped;
  };

  const groupedData = groupByDate(data);
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  const handleBandClick = (bandName) => {
    navigate(`/bands/${encodeURIComponent(bandName)}`);
  };

  return (
    <div>
      <h2>Shows List</h2>

      <input
        type="text"
        placeholder="Search by venue or name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
      />

      <select 
        value={selectedVenue}
        onChange={(e) => setSelectedVenue(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
      >
        <option value="">All Venues</option>
        {[...new Set(data.map(item => item.venue))].map((venue, index) => (
          <option key={index} value={venue}>
            {venue}
          </option>
        ))}
      </select>

      <table>
        <thead>
          <tr>
            <th>Venue</th>
            <th>Bands</th>
            <th>Start</th>
            <th>Event Link</th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.length === 0 ? (
            <tr><td colSpan={4}>No events found for the selected criteria.</td></tr>
          ) : (
            sortedDates.map(date => (
              <React.Fragment key={date}>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
                {groupedData[date].map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.venue}</td>
                    <td>
                      {item.bands.split(', ').map((band, index) => (
                        <span key={index}>
                          <button
                            onClick={() => handleBandClick(band)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'blue',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            }}
                          >
                            {band}
                          </button>
                          {index < item.bands.split(', ').length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                    <td>{new Date(item.start).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}</td>
                    <td>
                      {item.eventLink ? (
                        <a href={item.eventLink} target="_blank" rel="noopener noreferrer">
                          Event Link
                        </a>
                      ) : (
                        "No Link Available"
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ShowsTable;