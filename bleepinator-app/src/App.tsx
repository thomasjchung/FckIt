import { Box } from "@mui/material";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { DownloadView } from "./components/DownloadView";

function App() {
  return (
    <div className="App">
      <Navbar />
      <DownloadView />
    </div>
  );
}

export default App;
