import express from 'express';
import multer from 'multer';
import upload from '../middleware/upload.js'; // Multer middleware for handling file uploads
import pool from '../config/db.js';


const router = express.Router();

router.post('/upload', 
  upload.fields([
    { name: 'profile_image', maxCount: 1 },  // Expecting only 1 file for profile_image
    { name: 'other_images', maxCount: 5 }    // Expecting up to 5 files for other_images
  ]), 
  (req, res) => {
    try {
        // Check if the required files are uploaded
        if (!req.files || (!req.files['profile_image'] && !req.files['other_images'])) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Log the request body (non-file fields)
        console.log('Request body:', req.body);

        // Log the uploaded files
        console.log('Uploaded files:', req.files);

        // Process the uploaded files
        const uploadedProfileImage = req.files['profile_image'] 
          ? `/assets/images/bands/${req.files['profile_image'][0].filename}` 
          : null;

        const uploadedOtherImages = req.files['other_images']
          ? req.files['other_images'].map(file => `/assets/images/bands/${file.filename}`)
          : [];

        // Return the URLs of the uploaded files
        res.status(200).json({
            profile_image: uploadedProfileImage,
            other_images: uploadedOtherImages
        });
    } catch (err) {
        // Handle errors related to file uploads
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ error: err.message });
        }

        // Handle unexpected errors
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