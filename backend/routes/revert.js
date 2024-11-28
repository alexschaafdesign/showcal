import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Revert (delete) a file
router.delete('/revert', (req, res) => {
  try {
    const { filePath } = req.body; // Ensure FilePond sends the file path in the request body
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required.' });
    }

    // Construct the full path to the file
    const fullPath = path.join(__dirname, '../../assets', filePath);

    // Check if the file exists
    if (fs.existsSync(fullPath)) {
      // Delete the file
      fs.unlinkSync(fullPath);
      return res.status(200).json({ success: true, message: 'File deleted successfully.' });
    } else {
      return res.status(404).json({ error: 'File not found.' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({ error: 'Failed to delete file.' });
  }
});

export default router;