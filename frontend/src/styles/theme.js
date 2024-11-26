import { createTheme } from '@mui/material/styles';
import { red, blue, green, purple } from '@mui/material/colors';

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
        submit: {
          backgroundColor: purple[500],
          color: '#ffffff',
          '&:hover': {
            backgroundColor: purple [400],
          },
          padding: '12px 80px',
          textTransform: 'uppercase', // Prevent uppercase transformation
          fontFamily: '"Roboto", "Arial", sans-serif', // Set font family
          fontWeight: 600, // Set font weight
          fontSize: '1rem', // Set font size
        }
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Default variant
        fullWidth: true, // Full width by default
      },
      styleOverrides: {
        root: {
          marginBottom: '16px', // Consistent margin for spacing
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#000000', // Red color for helper text
          fontSize: '0.875rem', // Font size
          fontWeight: 400, // Font weight
          marginLeft: '4px', // Add a bit of spacing
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 0, 0, 0.6)', // Default label color
        },
        shrink: {
          transform: 'translate(14px, -6px) scale(0.75)', // Adjust position for floating
          color: blue[500], // Color when floating
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '4px', // Rounded corners
        },
        notchedOutline: {
          borderColor: blue[500], // Custom border color
        },
        input: {
          padding: '16.5px 14px', // Padding for input area
            },
          },
        },

        MuiFormLabel: {
          styleOverrides: {
            root: {
              backgroundColor: 'white', // Optional: Add background color to avoid overlap
              padding: '0 4px', // Padding to ensure the text fits inside the notch
              transform: 'translate(14px, -6px) scale(0.75)', // Proper floating label position
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
          color: red[500], // Green color for icon buttons
        },
      },
    },
  },
});

export default theme;