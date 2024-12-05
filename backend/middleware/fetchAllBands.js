import pool from "../config/db.js"; // Import the database pool
import formatBandData from "../utils/formatBandData.js"; // Import formatting utility

const fetchAllBandsMiddleware = async (req, res, next) => {
  try {
    const query = `
      SELECT id, name, genre, contact, play_shows, group_size, social_links, music_links, images, created_at
      FROM tcupbands;
    `;

    const { rows } = await pool.query(query);

    // Format the bands data
    req.bands = rows.map(formatBandData);

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error("Error fetching all TCUP bands:", error);
    res.status(500).json({ error: "Failed to fetch TCUP bands." });
  }
};

export default fetchAllBandsMiddleware;