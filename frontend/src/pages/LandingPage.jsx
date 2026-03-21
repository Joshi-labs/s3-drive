import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';

const features = [
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
        ),
        title: 'Instant uploads',
        desc: 'Drag & drop files directly to any folder with real-time progress tracking.',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
            </svg>
        ),
        title: 'Organized storage',
        desc: 'Nested folders, starring, recent access — everything structured the way you work.',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
        ),
        title: 'Fast search',
        desc: 'Find any file in seconds across your entire storage with full-text search.',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
        ),
        title: 'Role-based access',
        desc: 'Admin and guest roles with scoped permissions for safe sharing.',
    },
];

const LandingPage = () => (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Header />

        <main className="flex-grow">
            {/* Hero */}
            <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                    style={{
                        backgroundColor: 'var(--blue-subtle)',
                        border: '1px solid var(--blue-muted)',
                        color: 'var(--blue)',
                    }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--blue)' }}
                    />
                    Powered by AWS S3
                </div>

                <h1
                    className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
                >
                    Your files,{' '}
                    <span style={{ color: 'var(--blue)' }}>anywhere.</span>
                </h1>

                <p className="text-base md:text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                    A clean, fast file storage interface built on S3. Upload, organise, search, and share — without the bloat.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to="/login" className="btn-primary px-6 py-2.5 text-sm no-underline w-full sm:w-auto">
                        Get started →
                    </Link>
                    <Link
                        to="/login"
                        className="px-6 py-2.5 text-sm font-medium rounded-xl transition-all no-underline w-full sm:w-auto text-center"
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            boxShadow: 'var(--shadow-sm)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                        Continue as guest
                    </Link>
                </div>
            </section>

            {/* Mock UI Preview */}
            <section className="px-6 pb-16 max-w-4xl mx-auto">
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-xl)',
                        backgroundColor: 'var(--bg-elevated)',
                    }}
                >
                    {/* Fake titlebar */}
                    <div
                        className="flex items-center gap-2 px-4 py-3"
                        style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
                    >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                        <div
                            className="ml-3 flex-1 max-w-xs h-5 rounded-md"
                            style={{ backgroundColor: 'var(--bg-muted)' }}
                        />
                    </div>
                    {/* Fake content */}
                    <div className="p-5 flex gap-4">
                        {/* Fake sidebar */}
                        <div className="hidden sm:flex flex-col gap-2 w-36 flex-shrink-0">
                            {['My Drive', 'Recent', 'Starred', 'Trash'].map((item, i) => (
                                <div
                                    key={item}
                                    className="px-3 py-2 rounded-lg text-xs font-medium"
                                    style={{
                                        backgroundColor: i === 0 ? 'var(--blue-subtle)' : 'transparent',
                                        color: i === 0 ? 'var(--blue)' : 'var(--text-muted)',
                                    }}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                        {/* Fake grid */}
                        <div className="flex-1">
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Folders</div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-4">
                                {['Projects', 'Photos', 'Docs', 'Archive'].map(name => (
                                    <div key={name} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                        <div className="w-7 h-7 rounded-lg mb-2" style={{ backgroundColor: 'var(--blue-muted)' }} />
                                        <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{name}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Files</div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                {['report.pdf', 'photo.jpg', 'data.csv', 'notes.txt'].map(name => (
                                    <div key={name} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                        <div className="h-10" style={{ backgroundColor: 'var(--bg-muted)' }} />
                                        <div className="p-2 text-[9px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 pb-20 max-w-4xl mx-auto">
                <p
                    className="text-[11px] font-semibold uppercase tracking-widest text-center mb-8"
                    style={{ color: 'var(--text-muted)' }}
                >
                    What's included
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {features.map(f => (
                        <div
                            key={f.title}
                            className="p-5 rounded-2xl transition-all"
                            style={{
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                                style={{ backgroundColor: 'var(--blue-subtle)', color: 'var(--blue)' }}
                            >
                                {f.icon}
                            </div>
                            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>

        <Footer />
    </div>
);

export default LandingPage;