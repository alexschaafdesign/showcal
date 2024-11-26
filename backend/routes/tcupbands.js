import express from 'express';
import pool from '../config/db.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all TCUP bands
router.get('/', async (req, res) => {
  try {
    const query = `SELECT * FROM tcupbands;`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching TCUP bands:', error);
    res.status(500).json({ error: 'Failed to fetch TCUP bands' });
  }
});

// Get a specific TCUP band by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT * FROM tcupbands WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching TCUP band:', error);
    res.status(500).json({ error: 'Failed to fetch TCUP band' });
  }
});

// Add a new TCUP band
router.post(
  '/',
  upload.fields([
    { name: 'photos', maxCount: 3 },
    { name: 'stage_plot', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, genre, contact, play_shows, group_size, social_links } = req.body;

      const photos = req.files.photos?.map((file) => `/images/${file.filename}`) || [];
      const stagePlot = req.files.stage_plot?.[0]?.filename
        ? `/documents/${req.files.stage_plot[0].filename}`
        : null;

      const query = `
        INSERT INTO tcupbands (name, genre, contact, play_shows, group_size, photos, social_links, stage_plot)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
      `;
      const values = [name, genre, contact, play_shows, group_size, photos, social_links, stagePlot];

      const { rows } = await pool.query(query, values);
      res.status(201).json({ message: 'Band added successfully!', band: rows[0] });
    } catch (error) {
      console.error('Error adding band:', error);
      res.status(500).json({ error: 'Failed to add band' });
    }
  }
);

export default router;