import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

// Import FilePond plugins if needed
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

registerPlugin(FilePondPluginImagePreview);

const CustomFilePond = ({
  files,
  setFiles,
  endpoint,
  name, // Add the name prop
  allowMultiple = true,
  maxFiles = 10,
}) => {
  const [uploadError, setUploadError] = useState(null);

  return (
    <div>
      <FilePond
        files={files}
        allowMultiple={allowMultiple}
        maxFiles={maxFiles}
        onupdatefiles={(fileItems) => {
          console.log("Updated Files:", fileItems);
          setFiles(
            fileItems.map((item) => ({
              file: item.file, // New file object
              source: item.source, // Existing file path
            }))
          );
        }}
        name={name} // Pass the name prop to FilePond
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        server={{
          process: {
            url: `${endpoint}/upload`,
            method: "POST",
            onload: (response) => {
              const { filePath } = JSON.parse(response);
              console.log("File uploaded:", filePath);
              return filePath;
            },
            onerror: (error) => {
              console.error("Upload error:", error);
              setUploadError("Failed to upload file. Please try again.");
            },
          },
          load: (source, load) => {
            fetch(source)
              .then((res) => res.blob())
              .then(load)
              .catch((err) => console.error("Error loading file:", err));
          },
          revert: {
            url: `${endpoint}/revert`,
            method: "DELETE",
            onload: (response) => {
              console.log("File reverted:", response);
            },
          },
        }}
        acceptedFileTypes={["image/*", "application/pdf"]}
        allowReorder={true}
        instantUpload={true}
      />
      {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
    </div>
  );
};

export default CustomFilePond;