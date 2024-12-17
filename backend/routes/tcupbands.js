import express from "express";
import fetchAllBandsMiddleware from "../middleware/fetchAllBands.js";
import fetchBandMiddleware from "../middleware/fetchBand.js";
import upload from "../middleware/upload.js";
import uploadAndParse from "../middleware/uploadAndParse.js";
import { 
  getAllBands, 
  getBandById, 
  addBand, 
  updateBand 
} from "../controllers/bandController.js";
import pool from '../config/db.js';


const router = express.Router();

// Route: Fetch all bands
router.get("/", fetchAllBandsMiddleware, getAllBands);

// Route: Fetch a specific band by ID
router.get("/:bandid", fetchBandMiddleware, getBandById);

// Route: Fetch data for edit form (reuse same controller as get by ID)
router.get("/:bandid/edit", fetchBandMiddleware, getBandById);

// Route: Add a new band
router.post("/add", uploadAndParse, addBand);

// Route: Update an existing band
router.put("/:bandid/edit", uploadAndParse, updateBand);

// Route: Fetch shows associated with a band
router.get("/:id/shows", async (req, res) => {
  const bandId = req.params.id;

  try {
    const query = `
      SELECT 
        shows.id AS show_id,
        shows.start,
        shows.flyer_image,
        shows.event_link,
        shows.venue_id,
        shows.bands AS band_list,
        venues.venue AS venue_name,
        venues.location
      FROM 
        shows
      LEFT JOIN 
        venues ON shows.venue_id = venues.id
      WHERE 
        EXISTS (
          SELECT 1 
          FROM unnest(string_to_array(shows.bands, ',')) AS band_name
          WHERE band_name ILIKE (SELECT name FROM tcupbands WHERE id = $1)
        )
      ORDER BY 
        shows.start ASC;
    `;
    const { rows } = await pool.query(query, [bandId]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching shows for band:", error);
    res.status(500).json({ error: "Failed to fetch shows for band" });
  }
});

export default router;