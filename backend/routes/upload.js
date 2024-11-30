import express from 'express';
import multer from 'multer';
import upload from '../middleware/upload.js'; // Multer middleware for handling file uploads

const router = express.Router();

// Photo Upload Route
router.post('/upload', upload.array('images', 10), (req, res) => {
    try {
      // Handle missing files
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
  
      // Extract paths for uploaded files
      const uploadedImages = req.files.map((file) => `assets/images/${file.filename}`);
  
      console.log('Uploaded Images:', uploadedImages);
      console.log('Request Body:', req.body); // Logs any additional fields sent with the request
  
      // Respond with the list of uploaded file paths
      return res.status(200).json({ images: uploadedImages });
    } catch (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        return res.status(400).json({ error: err.message });
      }
  
      console.error('Unexpected Error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred during file upload' });
    }
  });

export default router;