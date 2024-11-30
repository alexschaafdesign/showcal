import palette from './colors/palette'; // Import your palette

export const tables = {
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
}
  