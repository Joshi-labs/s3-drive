import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import { ContactPage } from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';

import DashboardLayout from './layouts/DashboardLayout';
import DriveView from './pages/DriveView';
import RecentView from './pages/RecentView';
import StarredView from './pages/StarredView';
import TrashView from './pages/TrashView';
import SearchView from './pages/SearchView';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/drive" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="root" replace />} />
                    <Route path="root" element={<DriveView />} />
                    <Route path=":folderId" element={<DriveView />} />
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