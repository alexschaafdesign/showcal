// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home.js';
import About from './pages/About.js'; // Import the new page
import Calendar from './pages/Calendar.js';

const App = () => {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} /> {/* New route for About page */}
            </Routes>
        </Router>
    );
};

export default App;