import express from "express";
import pool from "../config/db.js";
import upload from "../middleware/upload.js";
import fetchAllBandsMiddleware from "../middleware/fetchAllBands.js";
import fetchBandMiddleware from "../middleware/fetchBand.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js"; // Centralized success response
import formatBandData from "../utils/formatBandData.js"; // Data formatting utility
import parseBandFields from "../utils/parseBandFields.js"; // Parse request fields
import { getAllBandsQuery, addBandQuery, updateBandQuery } from "../queries/bandQueries.js";

const router = express.Router();

/**
 * Route: Get all TCUP bands
 */
router.get("/", fetchAllBandsMiddleware, (req, res) => {
  sendSuccessResponse(res, req.bands); // Use bands attached by the middleware
});

/**
 * Route: Get a specific TCUP band by ID
 */
router.get("/:bandid", fetchBandMiddleware, (req, res) => {
  sendSuccessResponse(res, req.band); // Use the band attached by the middleware
});

/**
 * Route: Fetch data for edit form
 */
router.get("/:bandid/edit", fetchBandMiddleware, (req, res) => {
  console.log("Band data sent to frontend:", req.band);
  sendSuccessResponse(res, req.band); // Use the band attached by the middleware
});

/**
 * Route: Add a new TCUP band
 */
router.post("/add", upload.array("images", 10), async (req, res) => {
  try {
    console.log("Uploaded Images:", req.files); // Log uploaded files
    console.log("Request Body:", req.body); // Log raw body fields before parsing

    const { name, genre, contact, play_shows, group_size, social_links, images } = parseBandFields(req.body, req.files);

    console.log("Parsed Band Fields:", { name, genre, contact, play_shows, group_size, social_links, images });

    const values = [
      name,
      genre,
      contact,
      play_shows,
      `{${group_size.join(",")}}`, // PostgreSQL array for group_size
      JSON.stringify(social_links), // JSON stringify social links
      `{${images.map((img) => `"${img}"`).join(",")}}`, // PostgreSQL array for images
    ];

    console.log("Insert Values:", values); // Log values being sent to the database

    const { rows } = await pool.query(addBandQuery, values);

    sendSuccessResponse(res, rows[0]); // Return the newly added band
  } catch (error) {
    console.error("Error adding band:", error);
    res.status(500).json({ error: "Failed to add band" });
  }
});

/**
 * Route: Edit an existing TCUP band
 */
router.put("/:bandid/edit", upload.array("images", 10), async (req, res) => {
  try {
    const { bandid } = req.params;

    // Extract and parse fields
    const {
      name,
      genre,
      contact,
      play_shows,
      group_size,
      social_links,
      preUploadedImages,
      removedImages,
    } = req.body;

    // Parse data fields if necessary
    const formattedGroupSize = group_size ? JSON.parse(group_size) : [];
    const formattedSocialLinks = social_links ? JSON.parse(social_links) : {};
    const preUploadedImagesArray = preUploadedImages
      ? JSON.parse(preUploadedImages)
      : [];
    const removedImagesArray = removedImages
      ? JSON.parse(removedImages)
      : [];

    // Remove images listed in removedImages
    const updatedImages = preUploadedImagesArray.filter(
      (img) => !removedImagesArray.includes(img)
    );

    // Combine remaining images with new uploads
    const newImages = req.files.map((file) => `/assets/images/${file.filename}`);
    const allImages = [...updatedImages, ...newImages];

    // Prepare query values
    const values = [
      name,
      genre,
      contact,
      play_shows,
      `{${formattedGroupSize.join(",")}}`, // PostgreSQL array for group_size
      JSON.stringify(formattedSocialLinks), // JSON stringify for social links
      `{${allImages.map((img) => `"${img}"`).join(",")}}`, // PostgreSQL array for images
      bandid, // Band ID for WHERE clause
    ];

    console.log("Update Query Values:", values);

    // Execute the update query
    const { rows } = await pool.query(updateBandQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Band not found" });
    }

    // Format the returned data and send the response
    sendSuccessResponse(res, formatBandData(rows[0]));
  } catch (error) {
    console.error("Error updating band:", error);
    res.status(500).json({ error: "Failed to update band" });
  }
});

export default router;