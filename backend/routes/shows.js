import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all shows
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        shows.id AS show_id,
        shows.start,
        shows.flyer_image,
        shows.event_link,
        shows.venue_id,
        venues.venue AS venue_name,
        venues.location,
        array_agg(json_build_object('id', bands.id, 'name', bands.band)) AS bands
      FROM 
        shows
      LEFT JOIN 
        venues ON shows.venue_id = venues.id
      LEFT JOIN 
        show_bands ON shows.id = show_bands.show_id
      LEFT JOIN 
        bands ON show_bands.band_id = bands.id
      GROUP BY 
        shows.id, venues.id
      ORDER BY 
        shows.start ASC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// Get a specific show by ID
router.get('/:id', async (req, res) => {
  const showId = req.params.id;

  try {
    const query = `
      SELECT 
        shows.id AS show_id,
        shows.start,
        shows.flyer_image,
        shows.event_link,
        shows.venue_id,
        venues.venue AS venue_name,
        venues.location,
        array_agg(json_build_object('id', bands.id, 'name', bands.band)) AS bands
      FROM 
        shows
      LEFT JOIN 
        venues ON shows.venue_id = venues.id
      LEFT JOIN 
        show_bands ON shows.id = show_bands.show_id
      LEFT JOIN 
        bands ON show_bands.band_id = bands.id
      WHERE 
        shows.id = $1
      GROUP BY 
        shows.id, venues.id;
    `;
    const { rows } = await pool.query(query, [showId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: 'Failed to fetch show' });
  }
});

export default router;