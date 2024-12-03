import express from "express";
import pool from "../config/db.js";
import upload from "../middleware/upload.js";
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
router.post("/add", upload.single("cover_image"), async (req, res) => {
  try {
    const { venue, location, capacity } = req.body;

    const coverImagePath = req.file
      ? `/assets/images/${req.file.filename}`
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
});

// Edit an existing venue
router.put("/:venueId/edit", upload.single("cover_image"), async (req, res) => {
  try {
    const { venueId } = req.params;
    const { venue, location, capacity } = req.body;

    const coverImagePath = req.file
      ? `/assets/images/${req.file.filename}`
      : null;

    const query =
      "UPDATE venues SET venue = $1, location = $2, capacity = $3, cover_image = $4 WHERE id = $5 RETURNING *";
    const values = [name, location, capacity, coverImagePath, venueId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error editing venue:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;