import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

const ContactForm = ({ title, subtitle }) => {
    const [sent, setSent] = useState(false);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
            <Header />
            <main className="flex-grow flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                    <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>

                    {sent ? (
                        <div
                            className="p-5 rounded-2xl text-center animate-fade-in"
                            style={{
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                style={{ backgroundColor: '#dcfce7', color: 'var(--green)' }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Message sent!</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>We'll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <div
                            className="p-6 rounded-2xl"
                            style={{
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                                    <input type="text" className="input-base" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                    <input type="email" className="input-base" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
                                    <textarea
                                        className="input-base resize-none"
                                        rows={4}
                                        placeholder="How can we help?"
                                        style={{ lineHeight: '1.6' }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSent(true)}
                                    className="btn-primary w-full py-2.5 mt-1"
                                >
                                    Send message
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export const ContactPage = () => (
    <ContactForm
        title="Contact Sales"
        subtitle="Interested in S3 Drive for your team? We'd love to hear from you."
    />
);

export const AboutPage = () => (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Header />
        <main className="flex-grow px-6 py-16 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>About S3 Drive</h2>
            <p className="text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
                A personal file storage interface built on AWS S3 and Go.
            </p>

            <div className="space-y-6">
                {[
                    {
                        title: 'What is it?',
                        body: 'S3 Drive is a self-hosted file manager with a clean UI. It gives you Google Drive-like UX on top of your own S3 bucket — no vendor lock-in, full control.'
                    },
                    {
                        title: 'How it works',
                        body: 'Files are stored in AWS S3. The Go backend handles auth, presigned URLs, and metadata. The React frontend provides drag-and-drop uploads, nested folders, search, starring, and trash.'
                    },
                    {
                        title: 'Built by',
                        body: 'Built as a personal infrastructure project. Open to contributions and feedback.'
                    },
                ].map(({ title, body }) => (
                    <div
                        key={title}
                        className="p-5 rounded-2xl"
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                        }}
                    >
                        <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{title}</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{body}</p>
                    </div>
                ))}
            </div>
        </main>
        <Footer />
    </div>
);

export default ContactPage;