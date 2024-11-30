import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Revert (delete) a file
router.delete("/revert", (req, res) => {
  const { filename } = req.body;

  const filePath = path.join(__dirname, `../../assets/images/${filename}`);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).send("Failed to delete file.");
    }
    res.status(200).send(filename); // Respond with the deleted file name
  });
});

export default router;