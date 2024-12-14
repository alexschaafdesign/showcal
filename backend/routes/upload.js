import express from 'express';
import multer from 'multer';
import upload from '../middleware/upload.js'; // Multer middleware for handling file uploads
import pool from '../config/db.js';


const router = express.Router();

router.post('/upload', upload.array('images', 10), (req, res) => {
  try {
      if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'No files uploaded' });
      }

      console.log('Uploaded Files:', req.files);  // Log files for debugging
      const uploadedImages = req.files.map((file) => `/images/${file.filename}`);
      console.log('Uploaded Images:', uploadedImages);

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

router.post('/simple-upload', upload.single('image'), (req, res) => {
  console.log("File upload request received");
  if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }
  return res.status(200).json({ imageUrl: `/assets/images/${req.file.filename}` });
});

export default router;