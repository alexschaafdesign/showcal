import palette from './colors/palette'; // Import your palette

export const buttonStyles = {
  MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Round the corners of the buttons
          padding: '8px 16px', // Add padding
          textTransform: 'none', // Remove text transformation
        },
        contained: {
          backgroundColor: palette.primary.main, // Contained buttons use primary color
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: palette.primary.light,
          },
        },
        outlined: {
          borderColor: palette.primary.main,
          '&:hover': {
            borderColor: palette.primary.light,
          },
        },
        text: {
            borderColor: palette.primary.light,
            '&:hover': {
                backgroundColor: palette.neutral.light, // Light hover effect for text button
              },
            padding: '4px 4px',
          },
        submit: {
          backgroundColor: palette.primary.main,
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: palette.primary.light,
          },
          padding: '12px 80px',
          textTransform: 'uppercase', // Prevent uppercase transformation
          fontFamily: '"Roboto", "Arial", sans-serif', // Set font family
          fontWeight: 600, // Set font weight
          fontSize: '1rem', // Set font size
        }
      },
    },
  MuiIconButton: {
    styleOverrides: {
      root: {
        color: palette.warning.main,
      },
    },
  },
};