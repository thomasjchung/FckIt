import {
  Box,
  Button,
  Chip,
  Typography,
  styled,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

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

  const [inputValue, setInputValue] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (inputValue.trim() !== "") {
        setWords([...words, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const handleDelete = (wordToDelete: string) => {
    setWords(words.filter((word) => word !== wordToDelete));
  };

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

      formData.append("words", JSON.stringify(words));

      setLoading(true);
      setVideoUrl(null);

      try {
        const response = await fetch("http://127.0.0.1:5000/process_video", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed");
        }
        const data = await response.json();
        setVideoUrl(data.videoUrl);
        alert("Video processed successfully!");
      } catch (error) {
        console.error("Error");
      } finally {
        setLoading(false);
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
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={5}
        >
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
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography fontSize={25}>
            Input Words to Censor Here (default is Youtube TOS)
          </Typography>
          <TextField
            label="Type a word and press Enter"
            variant="outlined"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown} // Changed to onKeyDown
            fullWidth
            style={{ width: "300px" }}
            InputProps={{
              style: { padding: "1px 15px" },
            }}
            InputLabelProps={{
              style: { fontSize: "16px" },
            }}
          />
          <div style={{ marginTop: "10px" }}>
            {words.map((word, index) => (
              <span
                key={index}
                style={{
                  margin: "5px",
                  padding: "5px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "5px",
                }}
              >
                <Chip
                  key={index}
                  label={word}
                  onDelete={() => handleDelete(word)}
                  style={{ cursor: "pointer" }}
                />
              </span>
            ))}
          </div>
        </Box>

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          Submit
        </Button>

        {loading ? <CircularProgress size={24} /> : null}

        {videoUrl && (
          <Box mt={4}>
            <Typography fontSize={20}>Processed Video:</Typography>
            <video controls src={videoUrl} width="100%" />
          </Box>
        )}
      </Box>
    </form>
  );
};
