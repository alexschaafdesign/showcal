import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

function parseBandList(bandList) {
  if (!bandList) return [];
  // Split by commas and trim whitespace
  return bandList.split(',').map((band) => band.trim());
}

async function crossReferenceBands(bandsString) {
  const bandNames = parseBandList(bandsString).map((band) => band.toLowerCase());

  if (bandNames.length === 0) return [];

  const query = `
    SELECT id, LOWER(name) AS normalized_name
    FROM tcupbands
    WHERE LOWER(name) = ANY ($1::text[])
  `;
  const { rows } = await pool.query(query, [bandNames]);

  const tcupBandMap = rows.reduce((map, band) => {
    map[band.normalized_name] = band.id;
    return map;
  }, {});

  return bandNames.map((name) => ({
    name,
    id: tcupBandMap[name] || null,
  }));
}

router.get('/', async (req, res) => {
  const { venueId } = req.query; // Get venueId from query parameter
  
  try {
    let query = `
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
    `;
    
    // If venueId is provided, filter the results by venue_id
    if (venueId) {
      query += ` WHERE shows.venue_id = $1`;
    }
    
    query += ' ORDER BY shows.start ASC';
    
    const { rows: shows } = await pool.query(query, venueId ? [venueId] : []);
    
    // Process bands for each show
    const processedShows = await Promise.all(
      shows.map(async (show) => {
        const bandNames = show.band_list
          ? show.band_list.split(',').map((name) => name.trim())
          : [];

        const { rows: linkedBands } = await pool.query(
          `SELECT id, name FROM tcupbands WHERE name = ANY ($1::text[])`,
          [bandNames]
        );

        const formattedBands = bandNames.map((name) => {
          const linkedBand = linkedBands.find((band) => band.name.toLowerCase() === name.toLowerCase());
          return linkedBand
            ? { id: linkedBand.id, name: linkedBand.name }
            : { id: null, name };
        });

        return {
          ...show,
          bands: formattedBands,
        };
      })
    );

    res.json(processedShows);
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
        shows.bands AS band_list,
        venues.venue AS venue_name,
        venues.location
      FROM 
        shows
      LEFT JOIN 
        venues ON shows.venue_id = venues.id
      WHERE 
        shows.id = $1;
    `;
    const { rows } = await pool.query(query, [showId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    const show = rows[0];
    const linkedBands = await crossReferenceBands(show.band_list || '');
    res.json({
      ...show,
      bands: linkedBands,
    });
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: 'Failed to fetch show' });
  }
});

export default router;