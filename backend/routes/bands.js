import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all bands
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        band,
        social_links
      FROM bands;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bands:', error);
    res.status(500).json({ error: 'Failed to fetch bands' });
  }
});

// Get a specific band by ID
router.get('/:id', async (req, res) => {
  const bandId = req.params.id;

  try {
    const query = `
      SELECT 
        id,
        band,
        social_links
      FROM bands
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [bandId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Band not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching band:', error);
    res.status(500).json({ error: 'Failed to fetch band' });
  }
});

export default router;