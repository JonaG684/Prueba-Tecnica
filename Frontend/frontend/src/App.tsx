import React from 'react';
import theme from './theme';
import AppRoutes from './routes';
import { CssBaseline, ThemeProvider} from '@mui/material';

const App: React.FC = () => {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;

