import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#031634', 
    },
    secondary: {
      main: '#031634', 
    },
    background: {
      default: '#e1e8f0', 
    },
    text: {
      primary: '#031634', 
      secondary: '#031634', 
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
