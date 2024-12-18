import express from "express";
import pool from "../config/db.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";
import fetch from "node-fetch"; // For making API calls to Cloudinary

const router = express.Router();

// Helper function to upload images to Cloudinary
const uploadToCloudinary = async (file, preset) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    return data.secure_url; // Return the Cloudinary URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

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
router.post("/add", async (req, res) => {
  try {
    const { venue, location, capacity, cover_image_file } = req.body;

    // Upload cover image to Cloudinary
    const coverImageUrl = await uploadToCloudinary(
      cover_image_file,
      "venue-cover-image-upload"
    );

    const query =
      "INSERT INTO venues (venue, location, capacity, cover_image) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [venue, location, capacity, coverImageUrl];
    const result = await pool.query(query, values);

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error adding venue:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit an existing venue
router.put("/:venueId/edit", async (req, res) => {
  try {
    const { venueId } = req.params;
    const { venue, location, capacity, cover_image_file } = req.body;

    // Upload new cover image to Cloudinary if provided
    let coverImageUrl = null;
    if (cover_image_file) {
      coverImageUrl = await uploadToCloudinary(
        cover_image_file,
        "venue-cover-image-upload"
      );
    }

    const query =
      "UPDATE venues SET venue = $1, location = $2, capacity = $3, cover_image = COALESCE($4, cover_image) WHERE id = $5 RETURNING *";
    const values = [venue, location, capacity, coverImageUrl, venueId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Venue not found." });
    }

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error editing venue:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;