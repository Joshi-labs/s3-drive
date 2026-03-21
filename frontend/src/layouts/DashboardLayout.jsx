import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DriveNavbar from '../components/DriveNavbar';
import DriveSidebar from '../components/DriveSidebar';

const DashboardLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("drive_token")) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div
            className="flex flex-col h-screen"
            style={{ backgroundColor: 'var(--bg-base)' }}
        >
            <DriveNavbar onMenuClick={() => setMobileMenuOpen(true)} />

            <div className="flex flex-1 overflow-hidden">
                <DriveSidebar
                    isOpen={mobileMenuOpen}
                    closeMenu={() => setMobileMenuOpen(false)}
                />
                <main className="flex-1 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;