import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';

const ShowsTableCore = ({ data, onShowClick }) => {
  console.log("Shows data passed to ShowsTableCore:", data);  // Debugging step
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set today's date to midnight for comparison

  // Filter the data to include only events starting from today onwards
  const filteredData = data.filter((item) => {
    const eventDate = new Date(item.start);
    return eventDate >= today;
  });

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

  const groupedData = groupByDate(filteredData); // Use filtered data here
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Flyer</TableCell>
            <TableCell>Venue</TableCell>
            <TableCell>Bands</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>Event Link</TableCell>
          </TableRow>
        </TableHead>
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
                <TableRow>
                  <TableCell
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      fontWeight: '900',
                      textTransform: 'uppercase',
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
                {groupedData[date]
                  .sort((a, b) => new Date(a.start) - new Date(b.start))
                  .map((item, idx) => (
                    <TableRow
                      key={idx}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        console.log("Show ID clicked:", item.show_id);  // Add this log
                        onShowClick(item.show_id);
                      }}
                    >
                      <TableCell>
                        {item.flyer_image ? (
                          <a href={item.event_link} target="_blank" rel="noopener noreferrer">
                            <img
                              src={item.flyer_image}
                              alt="Flyer"
                              style={{
                                maxWidth: '150px',
                                maxHeight: '150px',
                                borderRadius: '5px',
                              }}
                            />
                          </a>
                        ) : (
                          'No Flyer'
                        )}
                      </TableCell>
                      <TableCell>{item.venue_name || 'Unknown Venue'}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {item.bands.map((band, index) => (
                            <Typography
                              key={`${item.id}-${band.id || band.name}-${index}`}
                              sx={{
                                fontWeight: band.id ? 'bold' : 'normal',
                                color: band.id ? 'primary.main' : 'grey.600',
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
                      <TableCell sx={{ fontSize: '18px' }}>
                        {new Date(item.start).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontSize: '18px' }}>
                        {item.event_link ? (
                          <a href={item.event_link} target="_blank" rel="noopener noreferrer">
                            Event Link
                          </a>
                        ) : (
                          'No Link Available'
                        )}
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