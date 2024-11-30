import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFilePoster from "filepond-plugin-file-poster";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFilePoster);

const CustomFilePond = ({
  files,
  setFiles,
  endpoint,
  allowMultiple = true,
  maxFiles = 10,
  preloadedFiles = [], // Preloaded images
  setRemovedFiles, // Callback for removed files
}) => {
  const [uploadError, setUploadError] = useState(null);

  // Combine preloaded files with new files
  const initialFiles = [
    ...preloadedFiles.map((file) => ({
      source: file, // Preloaded images
      options: { type: "local" }, // Mark these as existing files
    })),
    ...files,
  ];

  return (
    <div>
      <FilePond
        files={initialFiles} // Single source of truth for files
        allowMultiple={allowMultiple}
        maxFiles={maxFiles}
        onupdatefiles={(fileItems) => {
          setFiles(
            fileItems.map((item) => ({
              file: item.file || null, // For new files
              source: item.source || null, // For preloaded files
            }))
          );
        }}
        name="images" // Matches backend field
        labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>' // Single instance of labelIdle
        server={{
          process: {
            url: `${endpoint}/upload`,
            method: "POST",
            onload: (response) => {
              const { images } = JSON.parse(response); // Handle uploaded images
              console.log("Uploaded Images:", images);
              return images;
            },
            onerror: (error) => {
              console.error("Upload error:", error);
              setUploadError("Failed to upload file. Please try again.");
            },
          },
          load: (source, load) => {
            // Load preloaded files
            fetch(source)
              .then((res) => res.blob())
              .then(load)
              .catch((err) => console.error("Error loading file:", err));
          },
          revert: {
            url: `${endpoint}/revert`, // Endpoint for deleting files
            method: "DELETE",
            onload: (response) => {
              console.log("Removed Image:", response);
              setRemovedFiles((prev) => [...prev, response]); // Track removed files
            },
          },
        }}
        acceptedFileTypes={["image/*"]}
        instantUpload={true}
      />
      {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
    </div>
  );
};

export default CustomFilePond;