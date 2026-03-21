import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../assets/logo.png';
import { useTheme } from '../context/ThemeContext';

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

const LoginPage = () => {
    const navigate = useNavigate();
    const { theme, toggle } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ username: '', password: '' });

    const API_BASE = "https://s3-drive.vpjoshi.in";

    useEffect(() => {
        if (localStorage.getItem("drive_token")) navigate('/drive/root');
    }, []);

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const performLogin = async (endpoint, payload) => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { throw new Error(text || 'Server Error'); }
            if (!res.ok) throw new Error(data.message || data.error || 'Login failed');

            localStorage.setItem("drive_token", data.token);
            localStorage.setItem("user_role", payload.username ? "admin" : "guest");
            navigate('/drive');
        } catch (err) {
            setError(err.message || "Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        performLogin('/api/login', { username: formData.username, password: formData.password });
    };

    const handleGuestLogin = () => performLogin('/api/guest-login', {});

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4 relative"
            style={{ backgroundColor: 'var(--bg-base)' }}
        >
            {/* Theme toggle top right */}
            <button
                onClick={toggle}
                className="fixed top-4 right-4 p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Back link */}
            <Link
                to="/"
                className="mb-8 flex items-center gap-1.5 text-xs no-underline transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to home
            </Link>

            <div
                className="w-full max-w-sm rounded-2xl p-7 animate-fade-in-up"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xl)',
                }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-7">
                    <img src={Logo} alt="S3 Drive" className="w-14 h-14 object-contain rounded-2xl mb-3" style={{ boxShadow: 'var(--shadow-md)' }} />
                    <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Sign in to S3 Drive</h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="mb-4 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
                        style={{
                            backgroundColor: 'var(--red-subtle)',
                            border: '1px solid var(--red)',
                            color: 'var(--red)',
                        }}
                    >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="input-base"
                            placeholder="admin"
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="input-base"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="pt-1 space-y-2.5">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-2.5"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Signing in…
                                </span>
                            ) : 'Sign in'}
                        </button>

                        <div className="relative flex items-center gap-2">
                            <div className="flex-1 divider" />
                            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>or</span>
                            <div className="flex-1 divider" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                            className="w-full py-2.5 text-sm font-medium rounded-xl transition-all"
                            style={{
                                backgroundColor: 'var(--bg-subtle)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'var(--bg-muted)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                        >
                            Continue as Guest
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Guest users have read-only access to shared files.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;