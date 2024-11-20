import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BandProfile() {
  const { band } = useParams();
  const [loading, setLoading] = useState(true);
  const [bandData, setBandData] = useState(null);
  const [error, setError] = useState(null);
  const [shows, setShows] = useState([]);  // State to store shows

  useEffect(() => {
    const fetchBandData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcup/bands/${encodeURIComponent(band)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBandData(data || {});
      } catch (error) {
        setError("An error occurred while fetching the band data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchShows = async () => {
      try {
        const response = await fetch(`http://localhost:3001/tcup/shows/${encodeURIComponent(band)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const showsData = await response.json();
        setShows(showsData);
      } catch (error) {
        console.error("Failed to fetch shows for the band:", error);
      }
    };

    fetchBandData();
    fetchShows();
  }, [band]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!bandData) return <div>Band data not found</div>;

  return (
    <div>
      <h1>{bandData.band}</h1>
      {bandData.socialLinks && (
        <div>
          <h3>Social Links</h3>
          <ul>
            {Object.entries(bandData.socialLinks).map(([platform, url], index) => (
              <li key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display shows if available */}
      {shows.length > 0 && (
        <div>
          <h3>Past and future shows</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Venue</th>
                <th>Start Time</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show, index) => (
                <tr key={index}>
                  <td>{new Date(show.start).toLocaleDateString()}</td>
                  <td>{show.venue}</td>
                  <td>{new Date(show.start).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BandProfile;