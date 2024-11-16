import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

function ShowsTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [showTable, setShowTable] = useState('shows'); // Toggle between shows and bands

  // Fetch data based on `showTable` state
  useEffect(() => {
    const endpoint = `http://localhost:3001/tcup?table=${showTable}`;
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setData(data);  // Save data only if it’s an array
        } else {
          console.error("Fetched data is not an array:", data);
          setData([]); // Default to an empty array if data is not an array
        }
      })
      .catch(error => console.error("Error fetching data:", error));
  }, [showTable]);

  // Group data by date if available
  const groupByDate = (data) => {
    const grouped = {};
    data.forEach(item => {
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

  return (
    <div>
      <h2>{showTable === 'shows' ? 'Shows List' : 'Bands List'}</h2>

      {/* Toggle Button */}
      <button onClick={() => setShowTable(showTable === 'shows' ? 'bands' : 'shows')}>
        Show {showTable === 'shows' ? 'Bands' : 'Shows'}
      </button>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by venue or name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
      />

      {/* Venue filter dropdown */}
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

      {/* Conditional Table Rendering */}
      <table>
        <thead>
          {showTable === 'shows' ? (
            <tr>
              <th>Venue</th>
              <th>Bands</th>
              <th>Start</th>
              <th>Event Link</th>
            </tr>
          ) : (
            <tr>
              <th>Band Name</th>
              <th>Social Links</th>
            </tr>
          )}
        </thead>
        <tbody>
          {sortedDates.length === 0 ? (
            <tr><td colSpan={showTable === 'shows' ? 4 : 2}>No events or bands found for the selected criteria.</td></tr>
          ) : (
            sortedDates.map(date => (
              <React.Fragment key={date}>
                <tr>
                  <td colSpan={showTable === 'shows' ? 4 : 2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
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
                    {showTable === 'shows' ? (
                      <>
                        <td>{item.venue}</td>
                        <td>{item.bands}</td>
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
                      </>
                    ) : (
                      <>
                        <td>{item.bandName}</td>
                        <td>
                          {item.socialLinks ? (
                            <ul>
                              {Object.keys(item.socialLinks).map((platform, idx) => (
                                <li key={idx}>
                                  <a href={item.socialLinks[platform]} target="_blank" rel="noopener noreferrer">
                                    {platform}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "No Social Links"
                          )}
                        </td>
                      </>
                    )}
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