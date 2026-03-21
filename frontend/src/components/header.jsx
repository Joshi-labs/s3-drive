import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Logo from '../assets/logo.png';

const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
);

const Header = () => {
    const { theme, toggle } = useTheme();

    return (
        <header
            className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5"
            style={{
                backgroundColor: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            <Link to="/" className="flex items-center gap-2.5 no-underline">
                <img src={Logo} alt="S3 Drive" className="h-7 w-7 object-contain rounded-md" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>S3 Drive</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
                {[['/', 'Product'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
                    <Link
                        key={to}
                        to={to}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        {label}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggle}
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>

                <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors no-underline"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--blue)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    Log in
                </Link>
                <Link
                    to="/login"
                    className="btn-primary px-4 py-1.5 text-sm no-underline"
                >
                    Go to Drive
                </Link>
            </div>
        </header>
    );
};

export default Header;