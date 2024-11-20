import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

function Bands() {
    const [bands, setBands] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch the band data when the component mounts
    useEffect(() => {
        fetch('http://localhost:3001/tcup?table=bands')  // Updated URL to include query parameter
            .then(response => response.json())
            .then(data => {
                setBands(data);
                setLoading(false); // Data is loaded, stop the loading spinner
            })
            .catch(error => {
                console.error('Error fetching bands:', error);
                setLoading(false); // Stop loading on error
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Bands</h2>
            <table>
                <thead>
                    <tr>
                        <th>Band Name</th>
                        <th>Social Links</th>
                    </tr>
                </thead>
                <tbody>
                    {bands.length === 0 ? (
                        <tr><td colSpan="2">No bands found.</td></tr>
                    ) : (
                        bands.map((band, index) => (
                            <tr key={index}>
                                <td>
                                    {/* Wrap the band name in a Link to make it clickable */}
                                    <Link to={`/bands/${encodeURIComponent(band.band)}`}>
                                        {band.band}
                                    </Link>
                                </td>
                                <td>
                                    {band.socialLinks ? (
                                        Object.entries(band.socialLinks).map(([platform, link], idx) => (
                                            <div key={idx}>
                                                <a href={link} target="_blank" rel="noopener noreferrer">{platform}</a>
                                            </div>
                                        ))
                                    ) : (
                                        "No social links available"
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Bands;