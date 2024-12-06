import pool from "../config/db.js"; // Database pool for queries
import { getBandByIdQuery } from "../queries/bandQueries.js"; // Query to fetch a band by ID
import formatBandData from "../utils/formatBandData.js"; // Utility to format band data

const fetchBandMiddleware = async (req, res, next) => {
  const { bandid } = req.params;

  try {
    const { rows } = await pool.query(getBandByIdQuery, [bandid]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Band not found" });
    }

    req.band = formatBandData(rows[0]); // Attach formatted band data to `req`
    console.log("Formatted Band Images:", req.band.images);
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(`Error fetching TCUP band with ID ${bandid}:`, error);
    res.status(500).json({ error: "Failed to fetch band data." });
  }
};

export default fetchBandMiddleware;