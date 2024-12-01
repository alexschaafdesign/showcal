import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material'; // Added CssBaseline
import App from './App.js';
import theme from './styles/theme.js'; // Correct path

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline /> {/* Apply Material-UI baseline styles */}
    <Router>
      <App />
    </Router>
  </ThemeProvider>
);