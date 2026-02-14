import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';

const DriveNavbar = ({ onMenuClick, onLogout }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // Form State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });

    const userRole = localStorage.getItem("user_role");
    const userLabel = userRole === 'guest' ? "Guest User" : "Admin User";
    const userInitial = userLabel.charAt(0);

    const handleLogout = () => {
        localStorage.removeItem("drive_token");
        localStorage.removeItem("user_role");
        if (onLogout) onLogout();
        else navigate('/login');
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Updating...' });

        try {
            const response = await fetch('/api/admin/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('drive_token')}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            if (response.ok) {
                setStatus({ type: 'success', msg: 'Password updated! Logging out...' });
                setTimeout(handleLogout, 2000); // Force relog after change
            } else {
                const err = await response.text();
                setStatus({ type: 'error', msg: err || 'Update failed' });
            }
        } catch (error) {
            setStatus({ type: 'error', msg: 'Server error' });
        }
    };

    return (
        <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center flex-1 gap-3">
                <div className="md:hidden p-2 rounded-full active:bg-gray-100 -ml-2">
                    <button onClick={onMenuClick} className="text-gray-600 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
                <div className="flex items-center mr-2 md:mr-8">
                    <img src={Logo} alt="Logo" className="w-9 h-9 object-contain" />
                    <span className="text-lg font-medium text-gray-700 ml-2 hidden sm:block">S3 Drive</span>
                </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative ml-2 md:ml-4">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer shadow-md ring-2 ring-white transition-all focus:outline-none bg-gradient-to-br from-blue-700 to-indigo-300 text-white`}
                >
                    {userInitial}
                </button>

                {isProfileOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-sm font-bold text-gray-800">{userLabel}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Settings & Account</p>
                            </div>
                            
                            {/* ONLY SHOW FOR ADMIN */}
                            {userRole === 'admin' && (
                                <button 
                                    onClick={() => { setIsPasswordModalOpen(true); setIsProfileOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    Change Password
                                </button>
                            )}

                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center font-medium"
                            >
                                <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Log out
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* PASSWORD UPDATE MODAL */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Update Password</h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                            {status.msg && (
                                <div className={`p-3 rounded-lg text-xs font-medium ${
                                    status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {status.msg}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Password</label>
                                <input 
                                    type="password" required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">New Password</label>
                                <input 
                                    type="password" required minLength={6}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-all"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriveNavbar;