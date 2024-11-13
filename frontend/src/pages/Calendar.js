import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction'; 
import axios from 'axios';
import Button from '../components/button.js'; // Import the custom button component

const Calendar = () => {
  const [events, setEvents] = useState([]);  
  const [modalVisible, setModalVisible] = useState(false);  
  const [selectedEvent, setSelectedEvent] = useState(null);  
  const [filters, setFilters] = useState({
    venues: [],
    minCapacity: null,
    maxCapacity: null,
    filterByCapacity: false,  // New flag to determine if we're filtering by capacity
  });
  const [venues, setVenues] = useState([]);  
  const [dropdownOpen, setDropdownOpen] = useState(false);  
  const [searchTerm, setSearchTerm] = useState('');
  const [buttonStyle, setButtonStyle] = useState({});

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
          flyerImage: event.flyerImage,
          minCapacity: event.minCapacity,
          maxCapacity: event.maxCapacity
        }));
        
        const uniqueVenues = [...new Set(formattedEvents.map(event => event.venue))];
        
        setEvents(formattedEvents);
        setVenues(uniqueVenues);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });

    // Fetch Figma button data for styling
    axios.get('http://127.0.0.1:3001/figma-data')
      .then(response => {
        const figmaData = response.data;
        setButtonStyle({
          backgroundColor: figmaData.buttonColor || 'defaultColor',
          padding: '12px 24px',
          borderRadius: '4px'
        });
      })
      .catch(error => {
        console.error('Error fetching Figma data:', error);
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
    setFilters({ venues: [], minCapacity: null, maxCapacity: null, filterByCapacity: false });
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
        maxCapacity: null,  // No upper limit
        minCapacity: 2001,  // Set the minimum limit to 2001
        filterByCapacity: true
      }));
    } else if (value === "<150") {
      setFilters(prevState => ({
        ...prevState,
        maxCapacity: 149,  // Set the maximum to 149
        minCapacity: null,  // No minimum limit
        filterByCapacity: true
      }));
    } else if (value.includes("-")) {
      const [min, max] = value.split("-");
      setFilters(prevState => ({
        ...prevState,
        minCapacity: parseInt(min),
        maxCapacity: parseInt(max),
        filterByCapacity: true
      }));
    } else {
      setFilters(prevState => ({
        ...prevState,
        minCapacity: null,
        maxCapacity: null,
        filterByCapacity: false
      }));
    }
  };

  const filteredEvents = events.filter(event => {
    const venueMatch = filters.venues.length === 0 || filters.venues.includes(event.venue);
    const searchMatch =
      (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.venue || '').toLowerCase().includes(searchTerm.toLowerCase());
    const sizeMatch =
      (filters.filterByCapacity && (
        (filters.minCapacity === null || event.minCapacity >= filters.minCapacity) &&
        (filters.maxCapacity === null || event.maxCapacity <= filters.maxCapacity)
      )) || !filters.filterByCapacity;

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
          <Button onClick={() => setDropdownOpen(!dropdownOpen)} label="Select Venues" style={buttonStyle} />
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
            <select onChange={handleCapacityFilterChange} value={filters.minCapacity ? `${filters.minCapacity}-${filters.maxCapacity}` : ""}>
              <option value="">Select Capacity Range</option>
              <option value="<150">Under 150</option>
              <option value="150-350">150 - 350</option>
              <option value="350-500">350 - 500</option>
              <option value="500-1000">500 - 1000</option>
              <option value="1000-2000">1000 - 2000</option>
              <option value=">2000">Over 2000</option>
            </select>
          </div>

          {/* Custom Button styled by Figma */}
          <Button onClick={resetFilter} label="Reset Filter" style={buttonStyle} />
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
            <p><strong>Description:</strong> {selectedEvent.extendedProps.description}</p>
            <p><strong>Event Link:</strong> <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer">{selectedEvent.url}</a></p>
            <p><strong>Capacity:</strong> {selectedEvent.extendedProps.minCapacity === selectedEvent.extendedProps.maxCapacity
              ? `Capacity = ${selectedEvent.extendedProps.minCapacity}`
              : `Capacity = ${selectedEvent.extendedProps.minCapacity} - ${selectedEvent.extendedProps.maxCapacity}`}
            </p>
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