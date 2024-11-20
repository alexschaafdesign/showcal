// BandForm.js
import React, { useState } from 'react';

function BandForm() {
  const [band, setBand] = useState('');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', facebook: '', instagram: '', website: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/tcup/add-band', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ band, socialLinks }),
      });

      if (response.ok) {
        setMessage('Band added successfully!');
        setBand('');
        setSocialLinks({ twitter: '', facebook: '', instagram: '', website: '' });
      } else {
        setMessage('Error adding band.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error adding band.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks((prevLinks) => ({
      ...prevLinks,
      [name]: value,
    }));
  };

  return (
    <div>
      <h2>Add a New Band</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Band Name:
          <input
            type="text"
            value={band}
            onChange={(e) => setBand(e.target.value)}
            required // This makes the band name field required
          />
        </label>
        <label>
          Twitter:
          <input
            type="url"
            name="twitter"
            value={socialLinks.twitter}
            onChange={handleChange}
          />
        </label>
        <label>
          Facebook:
          <input
            type="url"
            name="facebook"
            value={socialLinks.facebook}
            onChange={handleChange}
          />
        </label>
        <label>
          Instagram:
          <input
            type="url"
            name="instagram"
            value={socialLinks.instagram}
            onChange={handleChange}
          />
        </label>
        <label>
          Website:
          <input
            type="url"
            name="website"
            value={socialLinks.website}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Add Band</button>
      </form>
    </div>
  );
}

export default BandForm;