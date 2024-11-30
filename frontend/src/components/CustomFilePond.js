// Import FilePond plugins
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
}) => {
  const [uploadError, setUploadError] = useState(null);

  return (
    <div>
      <FilePond
        files={files}
        allowMultiple={allowMultiple}
        maxFiles={maxFiles}
        onupdatefiles={(fileItems) => {
          setFiles(
            fileItems.map((item) => ({
              file: item.file, // New file object
              source: item.source, // Existing file path
              options: item.options, // Ensure existing file options are preserved
            }))
          );
        }}
        name="images" // Matches the field name expected by the backend
        labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
        server={{
          process: {
            url: `${endpoint}/upload`,
            method: "POST",
            onload: (response) => {
              const { images } = JSON.parse(response); // Adjust response structure
              console.log("File uploaded:", images);
              return images;
            },
            onerror: (error) => {
              console.error("Upload error:", error);
              setUploadError("Failed to upload file. Please try again.");
            },
          },
          load: (source, load) => {
            // Fetch existing files
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
        acceptedFileTypes={["image/*"]}
        allowReorder={false}
        instantUpload={true}
      />
      {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
    </div>
  );
};

export default CustomFilePond;