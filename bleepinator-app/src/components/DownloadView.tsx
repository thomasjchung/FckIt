import { Box, Button, Typography, styled } from "@mui/material";
import { useState } from "react";
//import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const DownloadView = () => {
  const [censorFile, setCensorFile] = useState<File | null>(null);
  const [bleepFile, setBleepFile] = useState<File | null>(null);

  const handleCensorFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    setCensorFile(file);
  };

  const handleBleepFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    setBleepFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (censorFile && bleepFile) {
      const formData = new FormData();
      formData.append("censorFile", censorFile);
      formData.append("bleepFile", bleepFile);

      try {
        const response = await fetch("http://127.0.0.1:5000/process_video", {
          method: "POST",
          body: formData,
        });
        console.log("Success!");
        const data = await response.json();
        console.log(data);
        alert("Video processed successfully!");
      } catch (error) {
        console.error("Error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box component="section" sx={{ p: 6, border: "5px dashed grey" }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography fontSize={25}>
            Clip to Censor (make sure no spaces)
          </Typography>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            style={{ display: "block", width: "200px" }}
          >
            Upload File
            <VisuallyHiddenInput
              type="file"
              onChange={handleCensorFileChange}
              accept="video/*"
            />
          </Button>
        </Box>
        {censorFile && <Typography>{censorFile.name}</Typography>}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography fontSize={25}>Clip to Bleep With</Typography>

          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            style={{ display: "block", width: "200px" }}
          >
            Upload File
            <VisuallyHiddenInput
              type="file"
              onChange={handleBleepFileChange}
              accept="video/*"
            />
          </Button>
          {bleepFile && <Typography>{bleepFile.name}</Typography>}
        </Box>

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Submit
        </Button>
      </Box>
    </form>
  );
};
