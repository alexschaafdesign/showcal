import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Processing file:", file);
    let folder = "assets/images";
    if (file.fieldname === "profile_image" || file.fieldname === "other_images") {
      folder = "assets/images/bands";
    }
    console.log("Destination folder:", folder);
    cb(null, path.join(__dirname, `../../${folder}`));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    console.log("Generated filename:", uniqueSuffix);
    cb(null, uniqueSuffix);
  },
});

// Set up Multer instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("Incoming file details:", file);
    const allowedTypes = ["image/jpeg", "image/png"];
    const isAllowed = allowedTypes.includes(file.mimetype);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // Max 10 files
  },
});

// Export upload middleware for use in routes
export default upload; // This exports the multer instance with .fields() method