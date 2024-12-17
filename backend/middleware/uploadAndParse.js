import upload from "../middleware/upload.js";
import parseBandFields from "../utils/parseBandFields.js";

const uploadAndParse = (req, res, next) => {
  console.log("Upload and parse middleware triggered");

  // Log the incoming headers and body before Multer handles the data
  console.log("Request Headers:", req.headers);  // Logs the headers
  console.log("Request Body before Multer:", req.body);  // Logs the form fields in the request

  // First, upload the files using the `upload` middleware
  upload.fields([{ name: "profile_image", maxCount: 1 }, { name: "other_images", maxCount: 5 }])(req, res, (err) => {
      console.log('Request body in multer:', req.body);  // Logs form fields
      console.log('Request files in multer:', req.files);  // Logs files from Multer
    if (err) {
      console.error("Error in Multer upload middleware:", err);
      // Handle Multer errors here
      return res.status(400).json({ error: err.message });
    }

      // If Multer is successful, log the files and proceed to the next middleware
      console.log('Request body after Multer:', req.body);  // Logs body after Multer processing
      console.log('Request files after Multer:', req.files);  // Logs the uploaded files

    try {
      const { files, body } = req;

      // Log incoming files for debugging
      console.log('Files received in uploadAndParse:', files);
      console.log('Request body:', body);

      // Parse the incoming form data (this includes images)
      const parsedData = parseBandFields(body, files);

      // Log the parsed data for debugging
      console.log('Parsed data (with images):', parsedData);

      // Store the parsedData (which includes the images) on the req object
      req.bandData = parsedData;  // All the parsed data, including images, are stored here

      next();
    } catch (error) {
      console.error("Error parsing uploaded data:", error);
      res.status(400).json({ error: "Invalid form data or file upload failed." });
    }
  });
};

export default uploadAndParse;