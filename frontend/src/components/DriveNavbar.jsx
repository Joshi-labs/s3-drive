import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Logo from '../assets/logo.png';

const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
);

const DriveNavbar = ({ onMenuClick, onLogout }) => {
    const navigate = useNavigate();
    const { theme, toggle } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });

    const userRole = localStorage.getItem("user_role");
    const userLabel = userRole === 'guest' ? "Guest User" : "Admin User";
    const userInitial = userRole === 'guest' ? 'G' : 'A';

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
                setTimeout(handleLogout, 2000);
            } else {
                const err = await response.text();
                setStatus({ type: 'error', msg: err || 'Update failed' });
            }
        } catch {
            setStatus({ type: 'error', msg: 'Server error' });
        }
    };

    return (
        <>
        <header
            className="h-14 flex items-center justify-between px-4 sticky top-0 z-30"
            style={{
                backgroundColor: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <MenuIcon />
                </button>
                <div className="flex items-center gap-2.5">
                    <img src={Logo} alt="S3 Drive" className="w-7 h-7 object-contain rounded-md" />
                    <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>
                        S3 Drive
                    </span>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1.5">
                {/* Theme Toggle */}
                <button
                    onClick={toggle}
                    title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>

                {/* Avatar */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all focus:outline-none"
                        style={{
                            background: userRole === 'guest'
                                ? 'linear-gradient(135deg, #64748b, #475569)'
                                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            boxShadow: '0 2px 8px rgb(0 0 0 / 0.2)',
                        }}
                    >
                        {userInitial}
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                            <div
                                className="absolute right-0 top-10 w-52 rounded-xl py-1.5 z-20 animate-fade-in-up"
                                style={{
                                    backgroundColor: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
                                <div className="px-3.5 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{userLabel}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                        {userRole === 'admin' ? 'Full access' : 'Read-only access'}
                                    </p>
                                </div>

                                {userRole === 'admin' && (
                                    <button
                                        onClick={() => { setIsPasswordModalOpen(true); setIsProfileOpen(false); }}
                                        className="w-full text-left px-3.5 py-2.5 text-sm flex items-center transition-colors"
                                        style={{ color: 'var(--text-secondary)' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LockIcon />
                                        Change Password
                                    </button>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3.5 py-2.5 text-sm flex items-center font-medium transition-colors"
                                    style={{ color: 'var(--red)' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--red-subtle)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogoutIcon />
                                    Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>

        {/* Password Modal */}
        {isPasswordModalOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgb(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
            >
                <div
                    className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in-up"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-xl)',
                    }}
                >
                    <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Update Password</h3>
                        <button
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="text-sm w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >✕</button>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                        {status.msg && (
                            <div
                                className="p-3 rounded-lg text-xs font-medium"
                                style={{
                                    backgroundColor: status.type === 'error' ? 'var(--red-subtle)' : 'var(--blue-subtle)',
                                    color: status.type === 'error' ? 'var(--red)' : 'var(--blue)',
                                }}
                            >{status.msg}</div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Password</label>
                            <input
                                type="password" required
                                className="input-base"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>New Password</label>
                            <input
                                type="password" required minLength={6}
                                className="input-base"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 btn-ghost">Cancel</button>
                            <button type="submit" className="flex-1 btn-primary">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default DriveNavbar;