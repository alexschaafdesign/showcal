import React, { useMemo } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview);

const CustomFilePond = ({
  files, // The `files` prop passed from the parent
  setFiles, // Callback to update files
  endpoint, // Dynamic endpoint for the server
  name = "images", // Name of the field (e.g., "profile_image" or "images")
  allowMultiple = true, // Whether multiple files are allowed
  maxFiles = 10, // Maximum number of files
}) => {
  // Memoize files to avoid unnecessary updates
  const memoizedFiles = useMemo(() => files, [files]);

  return (
    <FilePond
      files={memoizedFiles}
      onupdatefiles={(fileItems) => {
        const updatedFiles = fileItems.map((item) => ({
          file: item.file || null, // Blob for new files
          source: item.source || null, // Path for preloaded files
          options: item.options || {}, // Retain preloaded options
        }));

        console.log("Updated files in FilePond:", updatedFiles);
        setFiles(updatedFiles);
      }}
      allowMultiple={allowMultiple}
      maxFiles={maxFiles}
      name={name} // Dynamically set the field name
      server={{
        process: {
          url: `${endpoint}/upload`, // Dynamic endpoint for processing
          method: "POST",
          onload: (response) => {
            const parsedResponse = JSON.parse(response);
            console.log("Upload response:", parsedResponse);
            return parsedResponse; // Adjust based on API response structure
          },
        },
        load: (source, load) => {
          fetch(source)
            .then((res) => res.blob())
            .then(load)
            .catch((err) => console.error("Error loading file:", err));
        },
      }}
      labelIdle={`Drag & Drop your ${name} or <span class="filepond--label-action">Browse</span>`} // Dynamic label
      acceptedFileTypes={["image/png", "image/jpeg"]}
      instantUpload={false}
    />
  );
};

export default CustomFilePond;