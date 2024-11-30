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
  return (
    // Adjust `onupdatefiles` to separate preloaded images
        <FilePond
          files={files}
          onupdatefiles={(fileItems) => {
            setFiles(
              fileItems.map((item) => ({
                file: item.file || null, // New file object (only for new uploads)
                source: item.source || null, // Preloaded image source (only for preloaded)
                options: item.options || {}, // Preloaded file options
              }))
            );
          }}
          allowMultiple={allowMultiple}
          maxFiles={maxFiles}
          name="images"
          server={{
            process: {
              url: `${endpoint}/upload`,
              method: "POST",
              onload: (response) => JSON.parse(response).images,
              onerror: (error) => {
                console.error("Upload error:", error);
              },
            },
            load: (source, load) => {
              // Preloaded images: Fetch as blobs but mark them as preloaded
              fetch(source)
                .then((res) => {
                  if (!res.ok) throw new Error(`Failed to load image: ${source}`);
                  return res.blob();
                })
                .then((blob) => {
                  load(blob);
                  setFiles((prev) => [
                    ...prev,
                    { file: null, source, options: { type: "local" } }, // Explicitly mark preloaded
                  ]);
                })
                .catch((err) => {
                  console.error("Error loading file:", err);
                });
            },
          }}
          labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
          acceptedFileTypes={["image/png", "image/jpeg"]}
          instantUpload={true}
        />
  );
};

export default CustomFilePond;