import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "assets/images"; // Save all uploaded images in the specified folder
    cb(null, path.join(__dirname, `../../${folder}`)); // Resolve to the correct folder path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueSuffix); // Save file with a unique name
  },
});

// Set up Multer instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("Incoming file details:", file);

    const allowedTypes = ["image/jpeg", "image/png"]; // Allow only these formats
    const isAllowed = allowedTypes.includes(file.mimetype);

    if (isAllowed) {
      cb(null, true); // Accept file
    } else if (file.originalname === "blob" && file.mimetype === "text/html") {
      console.log("Ignoring preloaded image blob");
      cb(null, false); // Ignore preloaded blobs sent accidentally
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

export default upload; // Export the multer instance