import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icons from './icons';

const DriveSidebar = ({ isOpen, closeMenu }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Active Tab Logic
    const isActive = (path) => {
        if (path === '/drive/root' && (location.pathname === '/drive/root' || location.pathname.match(/^\/drive\/\d+$/))) return true;
        return location.pathname.includes(path);
    };

    const NavItem = ({ path, label, Icon }) => (
        <div 
            onClick={() => { navigate(path); closeMenu(); }}
            className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition ${
                isActive(path) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
            <Icon className={isActive(path) ? "text-blue-700" : "text-gray-500"} />
            <span className="ml-3">{label}</span>
        </div>
    );

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={closeMenu}></div>}
            
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-50">
                    <span className="font-bold text-lg text-gray-700">Menu</span>
                    <button onClick={closeMenu} className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <nav className="flex-grow mt-4 px-3 space-y-1">
                    <NavItem path="/drive/root" label="My Drive" Icon={Icons.Grid} />
                    <NavItem path="/drive/search" label="Search" Icon={Icons.Search} />
                    <NavItem path="/drive/recent" label="Recent" Icon={() => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <NavItem path="/drive/starred" label="Starred" Icon={() => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
                    <NavItem path="/drive/trash" label="Trash" Icon={() => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} />
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '5%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">9.75 GB of 2 TB used</p>
                </div>
            </div>
        </>
    );
};

export default DriveSidebar;