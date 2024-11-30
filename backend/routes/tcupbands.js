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
    console.log("[POST /add] Uploaded Images:", req.files);
    console.log("[POST /add] Request Body:", req.body);

    const { name, genre, contact, play_shows, group_size, social_links } =
      parseBandFields(req.body, req.files);

    // Ensure group_size and social_links are parsed correctly
    const parsedGroupSize =
      group_size && typeof group_size === "string" ? JSON.parse(group_size) : [];
    const parsedSocialLinks =
      social_links && typeof social_links === "string"
        ? JSON.parse(social_links)
        : {};

    console.log("[POST /add] Parsed Group Size:", parsedGroupSize);
    console.log("[POST /add] Parsed Social Links:", parsedSocialLinks);

    const uploadedImages = req.files.map((file) => `/assets/images/${file.filename}`);
    console.log("[POST /add] Uploaded Images:", uploadedImages);

    const values = [
      name,
      genre,
      contact,
      play_shows,
      `{${parsedGroupSize.join(",")}}`,
      JSON.stringify(parsedSocialLinks),
      `{${uploadedImages.map((img) => `"${img}"`).join(",")}}`,
    ];

    console.log("[POST /add] Insert Values:", values);

    const { rows } = await pool.query(addBandQuery, values);
    sendSuccessResponse(res, rows[0]);
  } catch (error) {
    console.error("[POST /add] Error adding band:", error);
    res.status(500).json({ error: "Failed to add band" });
  }
});

/**
 * Route: Edit an existing TCUP band
 */
router.put("/:bandid/edit", upload.array("images", 10), async (req, res) => {
  try {
    const { bandid } = req.params;
    if (!bandid) {
      return res.status(400).json({ error: "Band ID is required for editing" });
    }

    const {
      name,
      genre,
      contact,
      play_shows,
      group_size,
      social_links,
      preUploadedImages,
    } = req.body;

    console.log("[PUT /:bandid/edit] Raw Request Body:", req.body);

    // Parse preUploadedImages if provided
    const parsedPreUploadedImages = preUploadedImages
      ? JSON.parse(preUploadedImages)
      : [];
    console.log("[PUT /:bandid/edit] Parsed PreUploaded Images:", parsedPreUploadedImages);

    // Process new uploaded images from multer
    const newUploadedImages = req.files?.map(
      (file) => `/assets/images/${file.filename}`
    ) || [];
    console.log("[PUT /:bandid/edit] New Uploaded Images:", newUploadedImages);

    const allImages = [...parsedPreUploadedImages, ...newUploadedImages];
    console.log("[PUT /:bandid/edit] Combined Images:", allImages);

    const parsedGroupSize =
      group_size && typeof group_size === "string" ? JSON.parse(group_size) : [];
    const parsedSocialLinks =
      social_links && typeof social_links === "string"
        ? JSON.parse(social_links)
        : {};

    const values = [
      name,
      genre,
      contact,
      play_shows,
      `{${parsedGroupSize.join(",")}}`,
      JSON.stringify(parsedSocialLinks),
      `{${allImages.map((img) => `"${img}"`).join(",")}}`,
      bandid,
    ];

    console.log("[PUT /:bandid/edit] Update Query Values:", values);

    const { rows } = await pool.query(updateBandQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Band not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("[PUT /:bandid/edit] Error updating band:", error);
    res.status(500).json({ error: "Failed to update band" });
  }
});

export default router;