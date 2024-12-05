import pool from "../config/db.js";
import { addBandQuery, updateBandQuery } from "../queries/bandQueries.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";

export const getAllBands = (req, res) => {
  sendSuccessResponse(res, req.bands); // Use `req.bands` from middleware
};

export const getBandById = (req, res) => {
  sendSuccessResponse(res, req.band); // Use `req.band` from middleware
};

export const addBand = async (req, res) => {
    try {
      const { name, genre, contact, play_shows, group_size, social_links, music_links, images } = req.bandData;
  
      const values = [
        name,
        `{${genre}}`,
        contact,
        play_shows,
        `{${group_size.join(",")}}`,
        JSON.stringify(social_links),
        JSON.stringify(music_links),
        `{${images.map((img) => `"${img}"`).join(",")}}`,
      ];
  
      const query = `
        INSERT INTO tcupbands (name, genre, contact, play_shows, group_size, social_links, music_links, images)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
  
      const { rows } = await pool.query(query, values);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error("Error adding band:", error);
      res.status(500).json({ error: "Failed to add band." });
    }
  };

  const cleanArray = (arr) => {
    if (!Array.isArray(arr)) {
      console.error("Expected an array but got:", arr); // Debugging
      return [];
    }
    return arr.filter((item) => item && item.trim() !== ""); // Filter out empty or whitespace values
  };


  export const updateBand = async (req, res) => {
    try {
      const { bandid } = req.params;
      const { name, genre, contact, play_shows, group_size, social_links, music_links, images } = req.bandData;
  
      // Ensure genre and group_size are arrays and clean them
      const cleanGenre = cleanArray(genre || []); // Default to empty array if undefined
      const cleanGroupSize = cleanArray(group_size || []);
  
      // Ensure images are properly formatted
      const formattedImages = Array.isArray(images) && images.length
        ? `{${images.map((img) => `"${img}"`).join(",")}}`
        : "{}"; // Use an empty array literal for PostgreSQL
  
      const values = [
        name,
        `{${cleanGenre.join(",")}}`, // Join array for PostgreSQL array literal
        contact,
        play_shows,
        `{${cleanGroupSize.join(",")}}`,
        JSON.stringify(social_links || {}),
        JSON.stringify(music_links || {}),
        formattedImages,
        bandid,
      ];
  
      const query = `
        UPDATE tcupbands
        SET name = $1,
            genre = $2,
            contact = $3,
            play_shows = $4,
            group_size = $5,
            social_links = $6,
            music_links = $7,
            images = $8
        WHERE id = $9
        RETURNING *;
      `;
  
      const { rows } = await pool.query(query, values);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Band not found." });
      }
  
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error("Error updating band:", error);
      res.status(500).json({ error: "Failed to update band." });
    }
  };