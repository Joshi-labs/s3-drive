import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../components/icons'; // Adjusted path based on your previous messages
import Logo from '../assets/logo.png';

const DriveNavbar = ({ onMenuClick, onLogout }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // --- FIXED LOGIC ---
    // We check the stored role. If it says 'guest', we show Guest. Otherwise Admin.
    const userRole = localStorage.getItem("user_role");
    const userLabel = userRole === 'guest' ? "Guest User" : "Admin User";
    const userInitial = userLabel.charAt(0); // 'G' or 'A'

    // Logout Logic
    const handleLogout = () => {
        // Clear BOTH token and role
        localStorage.removeItem("drive_token");
        localStorage.removeItem("user_role");
        
        // If a parent handler was passed (from Dashboard), use it, otherwise nav directly
        if (onLogout) {
            onLogout();
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center flex-1 gap-3">
                {/* WIRED UP HAMBURGER MENU */}
                <div className="md:hidden p-2 rounded-full active:bg-gray-100 -ml-2">
                    <button onClick={onMenuClick} className="text-gray-600 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
                <div className="flex items-center mr-2 md:mr-8">
                    <div className="w-9 h-9 flex items-center justify-center">
                        <img src={Logo} alt="Logo" className="w-full h-full object-contain" onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-2xl">📂</span>'}} />
                    </div>
                    <span className="text-lg font-medium text-gray-700 ml-2 hidden sm:block">S3 Drive</span>
                </div>
                

            </div>

            {/*Portfolio*/}
            <div className="relative ml-2 md:ml-4">
            <a
                href="https://vpjoshi.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-md ring-2 ring-white bg-gradient-to-br from-blue-700 to-indigo-300 hover:ring-blue-200 transition-all"
                aria-label="Go to portfolio"
            >
                {/* Go To / External Link Icon */}
                <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                >
                <path d="M14 3h7v7" />
                <path d="M10 14L21 3" />
                <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
                </svg>
            </a>
            </div>

            {/*Profile*/}
            <div className="relative ml-2 md:ml-4">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer shadow-md ring-2 ring-white transition-all focus:outline-none ${
                        userRole === 'guest' 
                        ? 'bg-gradient-to-br from-blue-700 to-indigo-300 hover:ring-gray-200' // Grey for Guest
                        : 'bg-gradient-to-br from-blue-700 to-indigo-300 hover:ring-blue-200' // Purple for Admin
                    } text-white`}
                >
                    {userInitial}
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                    <>
                        {/* Invisible Backdrop to handle "click outside" */}
                        <div 
                            className="fixed inset-0 z-10 cursor-default" 
                            onClick={() => setIsProfileOpen(false)}
                        ></div>
                        
                        {/* The Menu Box */}
                        <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in-up origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-sm font-bold text-gray-800">{userLabel}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Manage your account</p>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center font-medium"
                            >
                                {/* Logout Icon */}
                                <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Log out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DriveNavbar;