import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction'; 
import axios from 'axios';

const Calendar = () => {
  const [events, setEvents] = useState([]);  
  const [modalVisible, setModalVisible] = useState(false);  
  const [selectedEvent, setSelectedEvent] = useState(null);  
  const [filters, setFilters] = useState({
    venues: [],
    capacity: null,
    filterByCapacity: false,
  });
  const [venues, setVenues] = useState([]);  
  const [dropdownOpen, setDropdownOpen] = useState(false);  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:3001/events')
      .then(response => {
        const formattedEvents = response.data.map(event => ({
          id: event.id,
          title: `${event.headliner} - ${event.venue}`,
          start: event.start,  // Assuming 'start' is already formatted as ISO string
          date: event.date,
          time: event.time,
          support: event.support,
          eventLink: event.eventLink,
          flyerImage: event.flyerImage,
          otherInfo: event.otherInfo,
          venue: event.venue,
          location: event.location,  // New field for location
          capacity: event.capacity,  // Adjusted to use single capacity value
        }));
        
        const uniqueVenues = [...new Set(formattedEvents.map(event => event.venue))];
        
        setEvents(formattedEvents);
        setVenues(uniqueVenues);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();
    setSelectedEvent(info.event);  
    setModalVisible(true);  
  };

  const closeModal = () => {
    setModalVisible(false);  
    setSelectedEvent(null);  
  };

  const resetFilter = () => {
    setFilters({ venues: [], capacity: null, filterByCapacity: false });
    setSearchTerm('');
  };

  const handleFilterChange = (e) => {
    const { value, checked } = e.target;
    setFilters(prevState => {
      let updatedVenues = [...prevState.venues];
      if (checked) {
        updatedVenues.push(value);  
      } else {
        updatedVenues = updatedVenues.filter(venue => venue !== value);  
      }
      return { ...prevState, venues: updatedVenues };
    });
  };

  const handleCapacityFilterChange = (e) => {
    const value = e.target.value;
    if (value === ">2000") {
      setFilters(prevState => ({
        ...prevState,
        capacity: 2001,
        filterByCapacity: true,
      }));
    } else if (value === "<150") {
      setFilters(prevState => ({
        ...prevState,
        capacity: 149,
        filterByCapacity: true,
      }));
    } else if (value.includes("-")) {
      const [min, max] = value.split("-");
      setFilters(prevState => ({
        ...prevState,
        capacity: { min: parseInt(min), max: parseInt(max) },
        filterByCapacity: true,
      }));
    } else {
      setFilters(prevState => ({
        ...prevState,
        capacity: null,
        filterByCapacity: false,
      }));
    }
  };

  const filteredEvents = events.filter(event => {
    const venueMatch = filters.venues.length === 0 || filters.venues.includes(event.venue);
    const searchMatch =
      (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.venue || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const sizeMatch = !filters.filterByCapacity || (
      typeof filters.capacity === 'number'
        ? event.capacity >= filters.capacity
        : event.capacity >= filters.capacity.min && event.capacity <= filters.capacity.max
    );

    return venueMatch && searchMatch && sizeMatch;
  });

  return (
    <div className="container">
      <div className="search-filter-container">
        {/* Search Field */}
        <div>
          <label>Search Events:</label>
          <input 
            type="text" 
            placeholder="Search by band, venue, or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}  
          />
        </div>

        {/* Venue Filter */}
        <div className="filters">
          <label>Filter by Venue:</label>
          <div className="dropdown">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>Select Venues</button>
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

          {/* Size Filter */}
          <div>
            <label>Filter by Venue Size:</label>
            <select onChange={handleCapacityFilterChange} value={filters.capacity ? `${filters.capacity.min || ""}-${filters.capacity.max || ""}` : ""}>
              <option value="">Select Capacity Range</option>
              <option value="<150">Under 150</option>
              <option value="150-350">150 - 350</option>
              <option value="350-500">350 - 500</option>
              <option value="500-1000">500 - 1000</option>
              <option value="1000-2000">1000 - 2000</option>
              <option value=">2000">Over 2000</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <button onClick={resetFilter}>Reset Filter</button>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}  
          eventClick={handleEventClick}  
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',  
          }}
        />
      </div>

      {/* Modal for event details */}
      {modalVisible && selectedEvent && (
        <div style={modalStyles.overlay} onClick={closeModal}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p><strong>Venue:</strong> {selectedEvent.extendedProps.venue}</p>
            <p><strong>Location:</strong> {selectedEvent.extendedProps.location}</p>
            <p><strong>Also playing:</strong> {selectedEvent.extendedProps.support}</p>
            <p><strong>Event Link:</strong> <a href={selectedEvent.extendedProps.eventLink} target="_blank" rel="noopener noreferrer">{selectedEvent.extendedProps.eventLink}</a></p>
            <p><strong>Capacity:</strong> {selectedEvent.extendedProps.capacity}</p>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
    textAlign: 'center',
    zIndex: 1001,
  }
};

export default Calendar;