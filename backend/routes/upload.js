import express from 'express';
import upload from '../middleware/upload.js'; // Multer middleware for handling file uploads
import multer from 'multer';

const router = express.Router();

// Upload Route
router.post('/upload', (req, res) => {
  const uploadMiddleware = upload.fields([
    { name: 'images', maxCount: 10 }, // For images
    { name: 'stage_plot', maxCount: 10 }, // For stage plot
  ]);

  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Unexpected Error:', err);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Check if files are uploaded
    if (!req.files || (!req.files.images && !req.files.stage_plot)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Extract paths for uploaded files
    const images = req.files.images
      ? req.files.images.map((file) => `/images/${file.filename}`)
      : [];
    const stagePlot = req.files.stage_plot
      ? `/documents/${req.files.stage_plot[0].filename}`
      : null;

    console.log('Uploaded Files:', { images, stagePlot });

    res.status(200).json({ images, stagePlot });
  });
});

export default router;