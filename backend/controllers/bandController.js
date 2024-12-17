import pool from '../config/db.js';
import { addBandQuery, updateBandQuery } from "../queries/bandQueries.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";
import cleanArray from "../utils/arrayUtils.js";

export const getAllBands = (req, res) => {
  sendSuccessResponse(res, req.bands);
};

export const getBandById = (req, res) => {
  sendSuccessResponse(res, req.band);
};

export const addBand = async (req, res) => {
  try {
    // Now social_links and music_links are guaranteed to be strings here
    const {
      name = "",
      genre = "[]",
      bandemail = "",
      play_shows = "no",
      group_size = "[]",
      social_links = "{}",
      music_links = "{}",
      profile_image = null,
      other_images = [],
    } = req.bandData;

    // Parse fields here, knowing they are strings:
    const parsedGenre = JSON.parse(genre);
    const parsedGroupSize = JSON.parse(group_size);
    const parsedSocialLinks = JSON.parse(social_links);
    const parsedMusicLinks = JSON.parse(music_links);

    // Clean arrays before converting to Postgres arrays
    const cleanGenre = cleanArray(parsedGenre).map(g => `"${g}"`);
    const cleanGroupSize = cleanArray(parsedGroupSize); // array of strings

    // Convert arrays to Postgres array literals
    // For empty arrays, use '{}'
    const pgGenre = `{${cleanGenre.join(",")}}`;
    const pgGroupSize = `{${cleanGroupSize.join(",")}}`; // e.g. {} if empty

    // social_links and music_links stored as JSON strings in DB
    const socialLinksStr = JSON.stringify(parsedSocialLinks);
    const musicLinksStr = JSON.stringify(parsedMusicLinks);

    // Handle images: only store filenames
    const formattedProfileImage = profile_image ? profile_image.split('/').pop() : null;

    // Convert other_images array to Postgres array literal
    // If no images, '{}'
   
    // Assuming other_images is an array of filenames:
    let formattedOtherImages = '{}';
    if (Array.isArray(other_images) && other_images.length > 0) {
      // Map each element to a double-quoted string
      const quotedImages = other_images.map(img => `"${img}"`);
      formattedOtherImages = `{${quotedImages.join(",")}}`;
    } else {
      formattedOtherImages = '{}';
    }

    const values = [
      name,           // text
      pgGenre,        // Postgres array literal for genre
      bandemail,      // text
      play_shows,     // text
      pgGroupSize,    // Postgres array literal for group_size
      socialLinksStr, // text field containing JSON string
      musicLinksStr,  // text field containing JSON string
      formattedProfileImage, // text (filename)
      formattedOtherImages   // Postgres array literal for other_images
    ];

    console.log("Values for INSERT query:", values);

    const { rows } = await pool.query(addBandQuery, values);

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error adding band:", error);
    res.status(500).json({ error: "Failed to add band." });
  }
};

export const updateBand = async (req, res) => {
  try {
    console.log('Band Data for update:', req.bandData);
    const {
      name = "",
      genre = "[]",
      bandemail = "",
      play_shows = "no",
      group_size = "[]",
      social_links = "{}",
      music_links = "{}",
      profile_image = null,
      other_images = []
    } = req.bandData;

    let parsedGenre, parsedGroupSize, parsedSocialLinks, parsedMusicLinks;

    try {
      parsedGenre = JSON.parse(genre);
      if (!Array.isArray(parsedGenre)) parsedGenre = [];
    } catch (err) {
      console.error("Error parsing genre in update:", genre, err);
      parsedGenre = [];
    }

    try {
      parsedGroupSize = JSON.parse(group_size);
      if (!Array.isArray(parsedGroupSize)) parsedGroupSize = [];
    } catch (err) {
      console.error("Error parsing group_size in update:", group_size, err);
      parsedGroupSize = [];
    }

    try {
      parsedSocialLinks = JSON.parse(social_links);
      if (typeof parsedSocialLinks !== 'object' || parsedSocialLinks === null) parsedSocialLinks = {};
    } catch (err) {
      console.error("Error parsing social_links in update:", social_links, err);
      parsedSocialLinks = {};
    }

    try {
      parsedMusicLinks = JSON.parse(music_links);
      if (typeof parsedMusicLinks !== 'object' || parsedMusicLinks === null) parsedMusicLinks = {};
    } catch (err) {
      console.error("Error parsing music_links in update:", music_links, err);
      parsedMusicLinks = {};
    }

    const cleanGenre = cleanArray(parsedGenre).map(g => `"${g}"`);
    const cleanGroupSize = cleanArray(parsedGroupSize).map(g => `"${g}"`);
    
    // Now wrap them:
    const pgGenre = `{${cleanGenre.join(",")}}`;
    const pgGroupSize = `{${cleanGroupSize.join(",")}}`;

    const formattedProfileImage = profile_image ? profile_image.split('/').pop() : null;
    
    let formattedOtherImages = '{}';
    if (Array.isArray(other_images) && other_images.length > 0) {
      // Map each element to a double-quoted string
      const quotedImages = other_images.map(img => `"${img}"`);
      formattedOtherImages = `{${quotedImages.join(",")}}`;
    } else {
      formattedOtherImages = '{}';
    }

    const values = [
      name,
      pgGenre,
      bandemail,
      play_shows,
      pgGroupSize,
      JSON.stringify(parsedSocialLinks),
      JSON.stringify(parsedMusicLinks),
      formattedProfileImage,
      formattedOtherImages,
      req.params.bandid
    ];

    console.log("Values for update query:", values);

    const { rows } = await pool.query(updateBandQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Band not found." });
    }

    res.status(200).json({ message: 'Band updated successfully' });
  } catch (error) {
    console.error('Error updating band:', error);
    res.status(500).json({ error: 'An error occurred while updating the band' });
  }
};