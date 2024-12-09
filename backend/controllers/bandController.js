import pool from '../config/db.js';
import { addBandQuery, updateBandQuery } from "../queries/bandQueries.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";
import cleanArray from "../utils/arrayUtils.js";

export const getAllBands = (req, res) => {
  sendSuccessResponse(res, req.bands); // Use `req.bands` from middleware
};

export const getBandById = (req, res) => {
  sendSuccessResponse(res, req.band); // Use `req.band` from middleware
};


  export const addBand = async (req, res) => {
    try {
      const { name, genre, bandemail, play_shows, group_size, social_links, music_links } = req.bandData;
  
      // Debugging: Log incoming data
      console.log("Incoming band data:", req.bandData);
  
      // Ensure genre and group_size are arrays and clean them
      const cleanGenre = cleanArray(genre || []); // Default to empty array if undefined
      const cleanGroupSize = cleanArray(group_size || []); // Default to empty array if undefined
  
      // Ensure images are properly formatted
      const formattedImages = Array.isArray(images) && images.length
        ? `{${images.map((img) => `"${img}"`).join(",")}}`
        : "{}"; // Default to empty array literal for PostgreSQL
  
      // Debugging: Log formatted values
      console.log("Formatted genre:", cleanGenre);
      console.log("Formatted group_size:", cleanGroupSize);
      console.log("Formatted images:", formattedImages);
  
      const values = [
        name || "", // Default to empty string if missing
        `{${cleanGenre.join(",")}}`, // Ensure genre is properly formatted
        bandemail || "", // Default to empty string if missing
        play_shows || "no", // Default to "no" if missing
        `{${cleanGroupSize.join(",")}}`, // Ensure group_size is properly formatted
        JSON.stringify(social_links || {}), // Default to empty object
        JSON.stringify(music_links || {}), // Default to empty object
        formattedImages, // Ensure images is a valid array literal
      ];
  
      // Debugging: Log final values before query
      console.log("Values for INSERT:", values);
  
      // Run the INSERT query
      const { rows } = await pool.query(addBandQuery, values);
  
      // Respond with the newly added band
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error("Error adding band:", error);
      res.status(500).json({ error: "Failed to add band." });
    }
  };


  export const updateBand = async (req, res) => {
    try {
      const { bandid } = req.params;
      const { name, genre, bandemail, play_shows, group_size, social_links, music_links } = req.bandData;
  
      // Clean and validate inputs
      const cleanGenre = cleanArray(genre || []);
      const cleanGroupSize = cleanArray(group_size || []);
      const formattedImages = Array.isArray(images) && images.length
        ? `{${images.map((img) => `"${img}"`).join(",")}}`
        : "{}";
  
      const values = [
        name,
        `{${cleanGenre.join(",")}}`,
        bandemail,
        play_shows,
        `{${cleanGroupSize.join(",")}}`,
        JSON.stringify(social_links || {}),
        JSON.stringify(music_links || {}),
        formattedImages,
        bandid,
      ];
  
      const { rows } = await pool.query(updateBandQuery, values);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Band not found." });
      }
  
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error("Error updating band:", error);
      res.status(500).json({ error: "Failed to update band." });
    }
  };