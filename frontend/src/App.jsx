import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Views
import DriveView from './pages/DriveView';   // Your existing main dashboard
import RecentView from './pages/RecentView'; // Create this file (empty component for now)
import StarredView from './pages/StarredView'; // Create this file
import TrashView from './pages/TrashView';     // Create this file
import SearchView from './pages/SearchView';   // Create this file

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage/>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* DASHBOARD ROUTES */}
            <Route path="/drive" element={<DashboardLayout />}>
                {/* Redirect /drive to /drive/root */}
                <Route index element={<Navigate to="root" replace />} />
                
                {/* Main Folder View */}
                <Route path="root" element={<DriveView />} />
                <Route path=":folderId" element={<DriveView />} />
                
                {/* New Views */}
                <Route path="recent" element={<RecentView />} />
                <Route path="starred" element={<StarredView />} />
                <Route path="trash" element={<TrashView />} />
                <Route path="search" element={<SearchView />} />
            </Route>
        </Routes>
    </Router>
  );
}

export default App;