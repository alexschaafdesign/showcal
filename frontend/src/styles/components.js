import palette from './colors/palette'; // Import your palette

export const components = {
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: '24px',
          borderRadius: '8px',
        },
      },
    },
    MuiCheckbox: {
        styleOverrides: {
          root: {
            color: '#1976d2', // Default unchecked color (use your preferred color)
            '&.Mui-checked': {
              color: '#0d47a1', // Checked color
            },
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)', // Hover effect
            },
            '&.Mui-disabled': {
              color: 'rgba(0, 0, 0, 0.26)', // Disabled state color
            },
          },
        },
        defaultProps: {
          disableRipple: true, // Disable ripple effect for cleaner UI
        },
      },
    MuiTab: {
        styleOverrides: {
          root: {
            color: 'black',
            backgroundColor: 'white', // Default background for inactive tabs
            '&.Mui-selected': {
              color: 'blue', // Selected tab color
              backgroundColor: 'lightblue', // Background for selected tab
            },
            '&:hover': {
              backgroundColor: 'lightgray', // Background on hover for inactive tabs
            },
          },
        },
      },
    MuiTabs: {
    styleOverrides: {
          root: {
            backgroundColor: '#f4f4f4', // Background color of the tabs container
            color: '#333', // Default text color
          },
          indicator: {
            backgroundColor: '#1976d2', // Color of the active tab underline
          },
        },
      },
    MuiSelect: {
        styleOverrides: {
          icon: {
            color: 'rgba(0, 0, 0, 0.54)', // Optional: Customize dropdown
          },
        },
      }, 
    MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.secondary.main, // Custom color for AppBar
            padding: '8px 16px',
          },
        },
      },
    MuiDrawer: {
        styleOverrides: {
          root: {
            backgroundColor: '#fff', // Background color for the Drawer
          },
        },
      },  
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px', // Round corners of the Card
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Custom shadow
            padding: '16px', // Add padding inside the Card
          },
        },
      },
  };
  