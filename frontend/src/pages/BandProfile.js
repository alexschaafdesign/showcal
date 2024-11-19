import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BandProfile() {
  const { bandName } = useParams();
  const [loading, setLoading] = useState(true);
  const [bandData, setBandData] = useState(null);

  useEffect(() => {
    const fetchBandData = async () => {
      try {
        const response = await fetch(`/api/bands/${bandName}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBandData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching band data:', error);
        setLoading(false);
      }
    };
    fetchBandData();
  }, [bandName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!bandData) {
    return <div>Band data not found</div>;
  }

  return (
    <div>
      <h1>{bandData.name}</h1>
      {/* Render additional band data here */}
    </div>
  );
}

export default BandProfile;