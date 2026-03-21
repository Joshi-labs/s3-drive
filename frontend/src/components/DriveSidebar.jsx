import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const nav = [
    {
        path: '/drive/root',
        label: 'My Drive',
        icon: (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
        ),
    },
    {
        path: '/drive/search',
        label: 'Search',
        icon: (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    {
        path: '/drive/recent',
        label: 'Recent',
        icon: (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        path: '/drive/starred',
        label: 'Starred',
        icon: (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
    },
    {
        path: '/drive/trash',
        label: 'Trash',
        icon: (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        ),
    },
];

const DriveSidebar = ({ isOpen, closeMenu }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/drive/root') {
            return location.pathname === '/drive/root' || /^\/drive\/\d+$/.test(location.pathname);
        }
        return location.pathname.startsWith(path);
    };

    const handleNav = (path) => {
        navigate(path);
        closeMenu();
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    style={{ backgroundColor: 'rgb(0 0 0 / 0.5)', backdropFilter: 'blur(2px)' }}
                    onClick={closeMenu}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    md:translate-x-0 md:static md:z-auto
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{
                    width: '220px',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRight: '1px solid var(--border)',
                    flexShrink: 0,
                }}
            >
                {/* Mobile header */}
                <div
                    className="flex items-center justify-between px-4 py-3 md:hidden"
                    style={{ borderBottom: '1px solid var(--border)' }}
                >
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Navigation</span>
                    <button
                        onClick={closeMenu}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    <p
                        className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: 'var(--text-muted)' }}
                    >Storage</p>

                    {nav.map(({ path, label, icon }) => {
                        const active = isActive(path);
                        return (
                            <button
                                key={path}
                                onClick={() => handleNav(path)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                                style={{
                                    backgroundColor: active ? 'var(--blue-subtle)' : 'transparent',
                                    color: active ? 'var(--blue)' : 'var(--text-secondary)',
                                    borderLeft: active ? '2px solid var(--blue)' : '2px solid transparent',
                                }}
                                onMouseEnter={e => {
                                    if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                                }}
                                onMouseLeave={e => {
                                    if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <span style={{ color: active ? 'var(--blue)' : 'var(--text-muted)' }}>{icon}</span>
                                {label}
                            </button>
                        );
                    })}
                </nav>

                {/* Storage quota */}
                <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Storage</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>5%</span>
                    </div>
                    <div
                        className="w-full rounded-full overflow-hidden"
                        style={{ height: '4px', backgroundColor: 'var(--bg-muted)' }}
                    >
                        <div
                            className="h-full rounded-full transition-all"
                            style={{ width: '5%', backgroundColor: 'var(--blue)' }}
                        />
                    </div>
                    <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>9.75 GB of 2 TB used</p>
                </div>
            </aside>
        </>
    );
};

export default DriveSidebar;