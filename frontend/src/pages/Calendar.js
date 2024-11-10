import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; 
import axios from 'axios';

const Calendar = () => {
  const [events, setEvents] = useState([]);  // State to store events
  const [modalVisible, setModalVisible] = useState(false);  // Control modal visibility
  const [selectedEvent, setSelectedEvent] = useState(null);  // Store selected event data
  const [filters, setFilters] = useState({
    venues: []  // Array to store selected venues
  });  
  const [venues, setVenues] = useState([]);  // State to store unique venue names
  const [dropdownOpen, setDropdownOpen] = useState(false);  // Control dropdown visibility
  const [searchTerm, setSearchTerm] = useState('');  // State for search term

  useEffect(() => {
    axios.get('http://127.0.0.1:3001/events')
      .then(response => {
        const formattedEvents = response.data.map(event => ({
          id: event.id,
          title: `${event.title} - ${event.venue}`,
          start: new Date(event.start).toISOString(),
          description: event.description,
          venue: event.venue,
          url: event.url,
          flyerImage: event.flyerImage
        }));
        
        // Extract unique venues
        const uniqueVenues = [...new Set(formattedEvents.map(event => event.venue))];
        
        setEvents(formattedEvents);
        setVenues(uniqueVenues);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();  // This will stop the link from being triggered
    setSelectedEvent(info.event);  // Set the clicked event to the state
    setModalVisible(true);  // Show the modal
  };

  const closeModal = () => {
    setModalVisible(false);  // Hide the modal
    setSelectedEvent(null);  // Clear the selected event
  };

  const handleFilterChange = (e) => {
    const { value, checked } = e.target;
    setFilters(prevState => {
      let updatedVenues = [...prevState.venues];
      if (checked) {
        updatedVenues.push(value);  // Add selected venue
      } else {
        updatedVenues = updatedVenues.filter(venue => venue !== value);  // Remove unselected venue
      }
      return { ...prevState, venues: updatedVenues };
    });
  };

  // Filter events by selected venues and search term
const filteredEvents = events.filter(event => {
  const venueMatch = filters.venues.length === 0 || filters.venues.includes(event.venue);
  
  // Check if the properties are null or undefined and default to an empty string
  const searchMatch =
    (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.venue || '').toLowerCase().includes(searchTerm.toLowerCase());
    
  return venueMatch && searchMatch;
});

  // Reset the filter
  const resetFilter = () => {
    setFilters({ venues: [] });
    setSearchTerm('');  // Clear search term when reset
  };

  return (
    <div>
      {/* Search Field */}
      <div>
        <label>Search Events:</label>
        <input 
          type="text" 
          placeholder="Search by band, venue, or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}  // Update search term
        />
      </div>

      {/* Venue Filter */}
      <div>
        <label>Filter by Venue:</label>
        <div className="dropdown">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="dropdown-btn">
            {filters.venues.length === 0 ? 'Select Venues' : filters.venues.join(', ')}
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {venues.map((venue, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    value={venue}
                    checked={filters.venues.includes(venue)}
                    onChange={handleFilterChange}
                  />
                  {venue}
                </label>
              ))}
            </div>
          )}
        </div>
        <button onClick={resetFilter}>Reset Filter</button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents}  // Pass the filtered events to the calendar
        eventClick={handleEventClick}  // Show modal when event is clicked
        className={modalVisible ? 'calendar-disabled' : ''}  // Apply class when modal is visible
      />
      
      {/* Modal */}
      {modalVisible && selectedEvent && (
        <div style={modalStyles.overlay} onClick={closeModal}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p><strong>Venue:</strong> {selectedEvent.extendedProps.venue}</p>
            <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
            <p><strong>Event Link:</strong> <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer">{selectedEvent.url}</a></p> {/* Now correctly showing event link */}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple modal styling
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // This is the scrim background color with opacity
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,  // Ensure the modal is above other content
  },
  modal: {
    backgroundColor: 'white',  // The modal itself is fully opaque
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
    textAlign: 'center',
    zIndex: 1001,  // Ensure the modal is above the overlay
  }
};

export default Calendar;