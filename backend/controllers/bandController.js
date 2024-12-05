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
    const { name, genre, contact, play_shows, group_size, social_links, images } = req.bandData;

    const values = [
      name,
      `{${genre}}`,
      contact,
      play_shows,
      `{${group_size.join(",")}}`,
      JSON.stringify(social_links),
      JSON.stringify({}),
      `{${images.join(",")}}`,
    ];

    const { rows } = await pool.query(addBandQuery, values);
    sendSuccessResponse(res, rows[0]);
  } catch (error) {
    console.error("Error adding band:", error);
    res.status(500).json({ error: "Failed to add band." });
  }
};

export const updateBand = async (req, res) => {
  try {
    const { bandid } = req.params;
    const { name, genre, contact, play_shows, group_size, social_links, images } = req.bandData;

    const values = [
      name,
      `{${genre}}`,
      contact,
      play_shows,
      `{${group_size.join(",")}}`,
      JSON.stringify(social_links),
      JSON.stringify({}),
      `{${images.join(",")}}`,
      bandid,
    ];

    const { rows } = await pool.query(updateBandQuery, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Band not found." });
    }

    sendSuccessResponse(res, rows[0]);
  } catch (error) {
    console.error("Error updating band:", error);
    res.status(500).json({ error: "Failed to update band." });
  }
};