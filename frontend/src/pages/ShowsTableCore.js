import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';

const ShowsTableCore = ({ data, onShowClick }) => {
  console.log("Shows data passed to ShowsTableCore:", data); // Debugging step
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set today's date to midnight for comparison


  // Filter the data to include only events starting from today onwards
  const filteredData = data.filter((item) => {
    const eventDate = new Date(item.start).setHours(0, 0, 0, 0);
    const todayDate = new Date(today).setHours(0, 0, 0, 0);
    return eventDate >= todayDate;
  });


  // Group events by date
  const groupByDate = (events) => {
    const grouped = {};
    events.forEach((item) => {
      if (item.start) {
        const showDate = new Date(item.start).toLocaleDateString();
        if (!grouped[showDate]) {
          grouped[showDate] = [];
        }
        grouped[showDate].push(item);
      }
    });
    return grouped;
  };

  const groupedData = groupByDate(filteredData);
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {sortedDates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                No upcoming events found.
              </TableCell>
            </TableRow>
          ) : (
            sortedDates.map((date) => (
              <React.Fragment key={date}>
                {/* Group Header Row */}
                <TableRow>
                  <TableCell
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      fontWeight: '900',
                      padding: '12px',
                      textTransform: 'uppercase',
                      fontSize: "20px",
                      background: '#d8d8d8',
                    }}
                  >
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>

                {/* Individual Event Rows */}
                {groupedData[date]
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((item, idx) => (
                    <TableRow
                      key={idx}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        console.log("Show ID clicked:", item.show_id);
                        onShowClick(item.show_id);
                      }}
                    >
                      {/* Flyer Image */}
                      <TableCell>
                        {item.flyer_image ? (
                          <a href={item.event_link} target="_blank" rel="noopener noreferrer">
                            <img
                              src={item.flyer_image}
                              alt="Flyer"
                              style={{
                                maxWidth: '100px',
                                maxHeight: '100px',
                                borderRadius: '5px',
                              }}
                            />
                          </a>
                        ) : (
                          'No Flyer'
                        )}
                      </TableCell>

                      {/* Venue Name */}
                      {/* Venue Name and Time */}
                      <TableCell>
                        <Typography 
                          variant="h6" 
                          sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 'bold' }}
                        >
                          {item.venue_name || 'Unknown Venue'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'grey.700', fontSize: '14px', marginTop: '4px' }}
                        >
                          {new Date(item.start).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </Typography>
                      </TableCell>

                      {/* Band Names */}
                      <TableCell>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {item.bands.map((band, index) => (
                            <Typography
                              key={`${item.id}-${band.id || band.name}-${index}`}
                              sx={{
                                fontWeight: band.id ? 'bold' : 'bold',
                                color: band.id ? 'primary.main' : 'grey.900',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              {band.name}
                              {band.id && (
                                <Chip
                                  label="TCUP BAND"
                                  color="primary"
                                  size="small"
                                  sx={{
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                  }}
                                />
                              )}
                            </Typography>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ShowsTableCore;