import React from 'react';

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export const Spinner = () => (
    <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 0', gap: '14px',
    }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
            style={{ animation: 'spin 0.75s linear infinite' }}>
            <circle cx="16" cy="16" r="13" stroke="var(--border)" strokeWidth="3"/>
            <path d="M16 3a13 13 0 0 1 13 13" stroke="var(--blue)" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading…</span>
    </div>
);

// ─── Section with label + responsive grid ─────────────────────────────────────
export const Section = ({ title, count, children }) => (
    <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--text-muted)',
            }}>
                {title}
            </span>
            {count !== undefined && (
                <span style={{
                    fontSize: '10px', fontWeight: 600,
                    padding: '1px 6px', borderRadius: '20px',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                }}>
                    {count}
                </span>
            )}
        </div>
        {/* item-grid class is defined in index.css with all breakpoints */}
        <div className="item-grid">
            {children}
        </div>
    </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle, actions }) => (
    <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px', textAlign: 'center',
    }}>
        <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            marginBottom: '16px',
        }}>
            {icon}
        </div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {title}
        </p>
        {subtitle && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                {subtitle}
            </p>
        )}
        {actions && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {actions}
            </div>
        )}
    </div>
);