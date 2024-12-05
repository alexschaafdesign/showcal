import upload from "../middleware/upload.js";
import parseBandFields from "../utils/parseBandFields.js";

const uploadAndParse = (req, res, next) => {
  try {
    const { files, body } = req;

    // Parse the incoming form data
    const parsedData = parseBandFields(body, files);

    // Ensure music_links is parsed correctly
    parsedData.music_links = body.music_links
    ? JSON.parse(body.music_links)
    : { spotify: "", bandcamp: "", soundcloud: "", youtube: "" };

    // Retrieve preUploadedImages from the request body and parse them
    const preUploadedImages = body.preUploadedImages
      ? JSON.parse(body.preUploadedImages)
      : [];

    // Map newly uploaded files to their URLs
    const newUploadedImages = files.map((file) => `/assets/images/${file.filename}`);

    // Combine preloaded images with newly uploaded images
    parsedData.images = [...preUploadedImages, ...newUploadedImages];

    // Attach the final parsed data (including combined images) to req
    req.bandData = parsedData;
    next();
  } catch (error) {
    console.error("Error parsing uploaded data:", error);
    res.status(400).json({ error: "Invalid form data or file upload failed." });
  }
};

export default [upload.array("images", 10), uploadAndParse];