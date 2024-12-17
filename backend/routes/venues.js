import express from "express";
import pool from "../config/db.js";
import upload from "../middleware/upload.js";  // Multer middleware for file uploads
import uploadAndParse from "../middleware/uploadAndParse.js";  // Custom parsing middleware
import sendSuccessResponse from "../utils/sendSuccessResponse.js";

const router = express.Router();

// Get all venues
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM venues";
    const result = await pool.query(query);
    sendSuccessResponse(res, result.rows);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single venue by ID
router.get("/:venueId", async (req, res) => {
  try {
    const { venueId } = req.params;
    const query = "SELECT * FROM venues WHERE id = $1";
    const result = await pool.query(query, [venueId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new venue
// Apply the upload.fields middleware for file uploads, then the uploadAndParse middleware, followed by the route handler.
router.post("/add", 
  upload.fields([{ name: "cover_image", maxCount: 1 }]), // Multer middleware to handle file uploads
  uploadAndParse,  // Custom middleware to parse the uploaded data
  async (req, res) => {  // Final route handler to process the request
    try {
      const { venue, location, capacity } = req.body;

      // Handle the cover image path
      const coverImagePath = req.files["cover_image"]
        ? `/assets/images/venues/${req.files["cover_image"][0].filename}`
        : null;

      const query =
        "INSERT INTO venues (venue, location, capacity, cover_image) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [venue, location, capacity, coverImagePath];
      const result = await pool.query(query, values);

      sendSuccessResponse(res, result.rows[0]);
    } catch (error) {
      console.error("Error adding venue:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Edit an existing venue
router.put("/:venueId/edit", 
  upload.fields([{ name: "cover_image", maxCount: 1 }]), // Multer for file upload
  uploadAndParse, // Parsing middleware
  async (req, res) => {  // Route handler
    try {
      const { venueId } = req.params;
      const { venue, location, capacity } = req.body;

      // Get the cover image path from uploaded file
      const coverImagePath = req.files["cover_image"]
        ? `/assets/images/venues/${req.files["cover_image"][0].filename}`
        : null;

      const query =
        "UPDATE venues SET venue = $1, location = $2, capacity = $3, cover_image = $4 WHERE id = $5 RETURNING *";
      const values = [venue, location, capacity, coverImagePath, venueId];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Venue not found" });
      }

      sendSuccessResponse(res, result.rows[0]);
    } catch (error) {
      console.error("Error editing venue:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;