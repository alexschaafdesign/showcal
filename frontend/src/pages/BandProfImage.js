import React, { useState } from 'react';
import { cloudName } from '../utils/cloudinary'; // Import the cloudName

const BandProfileImageUploader = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const uploadPreset = 'BandProfileImage'; // Your upload preset

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      setUploading(true);
      setError('');

      // Use cloudName directly
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        console.log('Uploaded Image URL:', data.secure_url);
      } else {
        setError('Failed to upload image.');
      }
    } catch (err) {
      setError('Error uploading image: ' + err.message);
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  };

  return (
    <div>
      <h2>Upload Band Profile Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Band Profile" style={{ width: '300px', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
};

export default BandProfileImageUploader;