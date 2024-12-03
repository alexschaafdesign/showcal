import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';

function ShowsTableCore({ data, onBandClick, onVenueClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const groupedData = groupByDate(filteredData);
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
                    <TableRow key={idx}>
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
                      <TableCell
                        style={{
                          textTransform: 'uppercase',
                          fontWeight: '400',
                          fontSize: '1.1rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => onVenueClick && onVenueClick(item.venue_id)}
                      >
                        {item.venue_name || 'Unknown Venue'}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {item.bands.map((band, index) =>
                            band.id ? (
                              <Button
                                key={index}
                                onClick={() => onBandClick && onBandClick(band.id)}
                                style={{
                                  textTransform: 'none',
                                  fontSize: '1rem',
                                  textAlign: 'left',
                                }}
                                variant="text"
                              >
                                {band.name}
                              </Button>
                            ) : (
                              <span key={index}>{band.name}</span>
                            )
                          )}
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
}

export default ShowsTableCore;