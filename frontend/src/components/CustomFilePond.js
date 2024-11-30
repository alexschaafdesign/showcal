import React, { useMemo } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview);

const CustomFilePond = ({
  files, // The `files` prop passed from the parent
  setFiles, // Callback to update files
  endpoint,
  allowMultiple = true,
  maxFiles = 10,
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
      name="images"
      server={{
        process: {
          url: `${endpoint}/upload`,
          method: "POST",
          onload: (response) => JSON.parse(response).images,
        },
        load: (source, load) => {
          fetch(source)
            .then((res) => res.blob())
            .then(load)
            .catch((err) => console.error("Error loading file:", err));
        },
      }}
      labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
      acceptedFileTypes={["image/png", "image/jpeg"]}
      instantUpload={false}
    />
  );
};

export default CustomFilePond;