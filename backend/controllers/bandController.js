import pool from '../config/db.js';
import { addBandQuery, updateBandQuery } from "../queries/bandQueries.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";
import cleanArray from "../utils/arrayUtils.js";

export const getAllBands = (req, res) => {
  sendSuccessResponse(res, req.bands);
};

export const getBandById = (req, res) => {
  sendSuccessResponse(res, req.band);
};

export const addBand = async (req, res) => {
  try {
    const {
      name = "",
      genre = [],
      bandemail = "",
      play_shows = "",
      group_size = [],
      social_links = {}, // Already parsed as an object
      music_links = {}, // Already parsed as an object
      profile_image = null,
      other_images = [],
    } = req.bandData;

    // Clean and prepare arrays
    const cleanGenre = cleanArray(genre).map(g => `"${g}"`); // Prepare for Postgres array
    const cleanGroupSize = cleanArray(group_size).map(g => `"${g}"`);

    const pgGenre = `{${cleanGenre.join(",")}}`; // Postgres array literal
    const pgGroupSize = `{${cleanGroupSize.join(",")}}`;

    // Prepare images
    const formattedProfileImage = profile_image || null; // Store as URL
    const formattedOtherImages = other_images.length
      ? `{${other_images.map(img => `"${img}"`).join(",")}}`
      : "{}"; // Postgres array literal

    // Convert objects to JSON strings for database storage
    const socialLinksStr = JSON.stringify(social_links);
    const musicLinksStr = JSON.stringify(music_links);

    const values = [
      name,
      pgGenre,
      bandemail,
      play_shows,
      pgGroupSize,
      socialLinksStr,
      musicLinksStr,
      formattedProfileImage,
      formattedOtherImages,
    ];

    console.log("Values for INSERT query:", values);

    const { rows } = await pool.query(addBandQuery, values);

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error adding band:", error);
    res.status(500).json({ error: "Failed to add band." });
  }
};

export const updateBand = async (req, res) => {
  try {
    console.log("Band Data for update:", req.bandData);

    const {
      name = "",
      genre = [],
      bandemail = "",
      play_shows = "",
      group_size = [],
      social_links = {},
      music_links = {},
      profile_image = null,        // New profile image
      other_images = [],           // New images array
      remove_images = [],          // Images to be removed
    } = req.bandData;

    const { bandid } = req.params;

    // Fetch the current images from the database
    const currentResult = await pool.query(
      "SELECT profile_image, other_images FROM tcupbands WHERE id = $1",
      [bandid]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: "Band not found." });
    }

    const currentImages = currentResult.rows[0];
    let updatedOtherImages = currentImages.other_images || [];

    // Remove specified images
    const imagesToRemove = new Set(remove_images);
    updatedOtherImages = updatedOtherImages.filter((img) => !imagesToRemove.has(img));

    // Add new images to the list
    if (other_images.length > 0) {
      updatedOtherImages.push(...other_images);
    }

    // Convert to Postgres array literal
    const formattedOtherImages = updatedOtherImages.length
      ? `{${updatedOtherImages.map((img) => `"${img}"`).join(",")}}`
      : "{}";

    // Prepare JSON strings and arrays
    const cleanGenre = cleanArray(genre).map((g) => `"${g}"`);
    const cleanGroupSize = cleanArray(group_size).map((g) => `"${g}"`);
    const pgGenre = `{${cleanGenre.join(",")}}`;
    const pgGroupSize = `{${cleanGroupSize.join(",")}}`;
    const socialLinksStr = JSON.stringify(social_links);
    const musicLinksStr = JSON.stringify(music_links);

    // Use new profile image if provided; otherwise, keep the existing one
    const updatedProfileImage = profile_image || currentImages.profile_image;

    const values = [
      name,
      pgGenre,
      bandemail,
      play_shows,
      pgGroupSize,
      socialLinksStr,
      musicLinksStr,
      updatedProfileImage,
      formattedOtherImages,
      bandid,
    ];

    console.log("Values for update query:", values);

    // Execute the update query
    const { rows } = await pool.query(updateBandQuery, values);

    res.status(200).json({
      message: "Band updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error updating band:", error);
    res.status(500).json({ error: "An error occurred while updating the band." });
  }
};