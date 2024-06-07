import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";

export const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div">
          F*ckIt
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
