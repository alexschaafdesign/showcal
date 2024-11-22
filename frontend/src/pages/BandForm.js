import React, { useState } from 'react';

function BandForm() {
  const [band, setBand] = useState('');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', facebook: '', instagram: '', website: '' });
  const [message, setMessage] = useState('');

  // Helper function to sanitize URLs
  const sanitizeUrl = (url) => {
    if (!url) return ''; // Return empty if the URL is empty
    if (!/^https?:\/\//i.test(url)) {
      // Add https:// if missing
      return `https://${url}`;
    }
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sanitize social links before sending
    const sanitizedLinks = Object.entries(socialLinks).reduce((acc, [key, value]) => {
      acc[key] = sanitizeUrl(value);
      return acc;
    }, {});

    try {
      const response = await fetch('http://localhost:3001/tcup/add-band', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ band, socialLinks: sanitizedLinks }),
      });

      if (response.ok) {
        setMessage('Band added successfully!');
        setBand('');
        setSocialLinks({ twitter: '', facebook: '', instagram: '', website: '' });
      } else {
        const errorData = await response.json();
        setMessage(`Error adding band: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error adding band. Please try again later.');
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
        <div>
          <label>
            Band Name:
            <input
              type="text"
              value={band}
              onChange={(e) => setBand(e.target.value)}
              required // This makes the band name field required
            />
          </label>
        </div>
        <div>
          <label>
            Twitter:
            <input
              type="text"
              name="twitter"
              value={socialLinks.twitter}
              onChange={handleChange}
              placeholder="e.g., twitter.com/bandname"
            />
          </label>
        </div>
        <div>
          <label>
            Facebook:
            <input
              type="text"
              name="facebook"
              value={socialLinks.facebook}
              onChange={handleChange}
              placeholder="e.g., facebook.com/bandname"
            />
          </label>
        </div>
        <div>
          <label>
            Instagram:
            <input
              type="text"
              name="instagram"
              value={socialLinks.instagram}
              onChange={handleChange}
              placeholder="e.g., instagram.com/bandname"
            />
          </label>
        </div>
        <div>
          <label>
            Website:
            <input
              type="text"
              name="website"
              value={socialLinks.website}
              onChange={handleChange}
              placeholder="e.g., www.bandwebsite.com"
            />
          </label>
        </div>
        <div>
          <button type="submit">Add Band</button>
        </div>
      </form>
    </div>
  );
}

export default BandForm;