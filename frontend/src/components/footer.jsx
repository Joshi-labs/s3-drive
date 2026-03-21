const Footer = () => (
    <footer
        className="py-8 mt-auto"
        style={{
            backgroundColor: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border)',
        }}
    >
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span style={{ color: 'var(--text-muted)' }}>© 2024 S3 Drive. All rights reserved.</span>
            <div className="flex gap-4">
                {['Privacy', 'Terms', 'Support'].map(link => (
                    <a
                        key={link}
                        href="#"
                        className="no-underline transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        {link}
                    </a>
                ))}
            </div>
        </div>
    </footer>
);

export default Footer;