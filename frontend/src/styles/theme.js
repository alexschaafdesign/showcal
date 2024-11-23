import { createTheme } from '@mui/material/styles';
import { red, blue, green } from '@mui/material/colors';

// Create the theme
const theme = createTheme({
  // Palette (colors)
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#d32f2f', // Red
    },
    error: {
      main: red.A400, // Red for error
    },
    background: {
      default: '#f4f4f4', // Light background color
      paper: '#ffffff',  // Paper background color (used for cards, etc.)
    },
    text: {
      primary: '#000000', // Black text color
      secondary: '#ffffff', // White text color for contrast
    },
  },

  // Typography (fonts)
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Default font
    h1: {
      fontSize: '2.5rem', // Large font for headings
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.5rem',
    },
    h4: {
      fontSize: '1.25rem',
    },
    h5: {
      fontSize: '1rem',
    },
    h6: {
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem', // Regular text size
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none', // Prevent uppercase transformation on buttons
    },
  },

  // Spacing (controls default spacing used in Material-UI components)
  spacing: 8, // Set the base spacing unit

  // Components (customization for specific components)
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Round the corners of the buttons
          padding: '8px 16px', // Add padding
          textTransform: 'none', // Remove text transformation
        },
        contained: {
          backgroundColor: blue[500], // Contained buttons use primary color
          color: '#fff',
          '&:hover': {
            backgroundColor: blue[600],
          },
        },
        outlined: {
          borderColor: blue[500],
          '&:hover': {
            borderColor: blue[100],
          },
        },
        text: {
            borderColor: blue[500],
            '&:hover': {
                backgroundColor: '#ffffff', // Light hover effect for text button
              },
            padding: '4px 4px',
          },
      },
    },
    MuiTextField: {
        styleOverrides: {
          root: {
            marginBottom: '16px', // Add margin bottom to text fields
          },
          input: {
            paddingTop: '16px',  // Adjust padding for the text input area
            paddingBottom: '8px', // Optional: Add more padding to the bottom of the input
          },
        },
        defaultProps: {
          InputLabelProps: {
          },
          InputProps: {
            style: {
              borderColor: blue[500], // Optional: Change the border color of the input box
              borderRadius: '4px', // Optional: Add rounded corners to the input box
              paddingLeft: '12px', // Optional: Add padding to the left inside the input field
              paddingRight: '12px', // Optional: Add padding to the right inside the input field
            },
          },
        },
     },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: blue[500], // Custom color for AppBar
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: '24px', // Add padding to the dialog content
          borderRadius: '8px', // Round the corners of the dialog
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: '3rem', // Example: change size of h1 elements globally
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'collapse', // Prevents border spacing between table cells
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px', // Add padding to table cells
        },
        head: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '1.5rem',
        date: {
            textTransform: 'capitalize',
            color: '#f4f4f4',
        }
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f5f5f5', // Light hover effect for rows
          },
        },
        head: {
            backgroundColor: '#9454cf', // Light purple background for table headers
            '&:hover': {
              backgroundColor: '#c873e6',
            },
        },
        date: {
            backgroundColor: '#9454cf', // Light purple background for table headers
            '&:hover': {
              backgroundColor: '#c873e6', 
        }
        }
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
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: green[500], // Green color for icon buttons
        },
      },
    },
  },
});

export default theme;