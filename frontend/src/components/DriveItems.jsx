import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── Icons ────────────────────────────────────────────────────────────────────
const MoreIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5"  r="2"/>
        <circle cx="12" cy="12" r="2"/>
        <circle cx="12" cy="19" r="2"/>
    </svg>
);

const FolderSVG = ({ active }) => (
    <svg viewBox="0 0 24 24" width="36" height="36"
        fill={active ? 'var(--blue)' : 'var(--text-muted)'}
        style={{ transition: 'fill 0.15s', flexShrink: 0 }}
    >
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
);

const FileIconGeneric = () => (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="var(--blue)">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
);

const FileIconPDF = () => (
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
        <rect width="40" height="40" rx="8" fill="#fee2e2"/>
        <path d="M10 30V10h13l8 8v12H10z" fill="#fca5a5"/>
        <path d="M23 10v8h8" stroke="#ef4444" strokeWidth="1.5" fill="none"/>
        <text x="13" y="27" fontSize="8" fontWeight="700" fill="#dc2626">PDF</text>
    </svg>
);

const FileIconImage = () => (
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
        <rect width="40" height="40" rx="8" fill="#dcfce7"/>
        <path d="M8 28l9-11 6 8 4-5 6 8H8z" fill="#86efac"/>
        <circle cx="28" cy="14" r="4" fill="#4ade80"/>
    </svg>
);

const StarIcon = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
);

const LinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
);

const RestoreIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
);

// ─── Portal Dropdown — renders into <body> so it's never clipped ──────────────
const MENU_WIDTH  = 168;
const MENU_HEIGHT = 130; // rough height for 3-item menu

const PortalDropdown = ({ anchorRef, isOpen, onClose, children }) => {
    const [style, setStyle] = useState({});

    const reposition = useCallback(() => {
        if (!anchorRef.current) return;
        const r = anchorRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - r.bottom;
        const spaceRight  = window.innerWidth  - r.right;

        const top  = spaceBelow >= MENU_HEIGHT
            ? r.bottom + 4
            : r.top - MENU_HEIGHT - 4;

        // Prefer aligning right-edge of menu with right-edge of button
        let left = r.right - MENU_WIDTH;
        // But clamp so it doesn't go off left edge
        if (left < 8) left = 8;
        // And don't go off right edge
        if (left + MENU_WIDTH > window.innerWidth - 8) {
            left = window.innerWidth - MENU_WIDTH - 8;
        }

        setStyle({ top, left, width: MENU_WIDTH });
    }, [anchorRef]);

    useEffect(() => {
        if (!isOpen) return;
        reposition();
        window.addEventListener('scroll', onClose, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', onClose, true);
            window.removeEventListener('resize', reposition);
        };
    }, [isOpen, reposition, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Full-screen backdrop — closes on any tap/click outside */}
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                onClick={onClose}
                onTouchEnd={e => { e.preventDefault(); onClose(); }}
            />
            <div
                style={{
                    position: 'fixed',
                    zIndex: 9999,
                    borderRadius: '12px',
                    padding: '6px 0',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'fadeInUp 0.15s ease both',
                    ...style,
                }}
            >
                {children}
            </div>
        </>,
        document.body
    );
};

// ─── Menu Button + Dropdown ───────────────────────────────────────────────────
const ItemMenu = ({ onAction, isStarred, viewMode }) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);

    const toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(o => !o);
    };

    const pick = (action, e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        onAction?.(action);
    };

    const menuItems = viewMode === 'trash'
        ? [
            { action: 'restore', label: 'Restore',        icon: <RestoreIcon />, color: 'var(--green)' },
            { divider: true },
            { action: 'delete',  label: 'Delete forever', icon: <TrashIcon />,   color: 'var(--red)',  bold: true },
        ]
        : [
            { action: 'star',   label: isStarred ? 'Unstar' : 'Star', icon: <StarIcon filled={isStarred} />, color: isStarred ? 'var(--yellow)' : 'var(--text-secondary)' },
            { action: 'copy',   label: 'Copy link',    icon: <LinkIcon />,   color: 'var(--text-secondary)' },
            { divider: true },
            { action: 'delete', label: 'Move to trash', icon: <TrashIcon />, color: 'var(--red)', bold: true },
        ];

    return (
        // Wrapper stops click from bubbling up to card (folder nav / file download)
        <div onClick={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
            <button
                ref={btnRef}
                onClick={toggle}
                aria-label="Options"
                style={{
                    // 40×40 minimum touch target — critical for mobile
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: open ? 'var(--bg-subtle)' : 'transparent',
                    transition: 'background-color 0.12s, color 0.12s',
                    // Always visible — no opacity trick. Hover gives a bg tint on desktop.
                    WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                    if (!open) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                }}
            >
                <MoreIcon />
            </button>

            <PortalDropdown anchorRef={btnRef} isOpen={open} onClose={() => setOpen(false)}>
                {menuItems.map((item, i) =>
                    item.divider ? (
                        <div key={i} style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 8px' }} />
                    ) : (
                        <button
                            key={item.action}
                            onClick={e => pick(item.action, e)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%',
                                padding: '9px 12px',
                                fontSize: '13px',
                                fontWeight: item.bold ? 600 : 400,
                                color: item.color,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                // Bigger touch target
                                minHeight: '40px',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor =
                                    item.action === 'delete' ? 'var(--red-subtle)' : 'var(--bg-subtle)';
                            }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    )
                )}
            </PortalDropdown>
        </div>
    );
};

// ─── File type icon picker ────────────────────────────────────────────────────
const getFileIcon = (name) => {
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(name)) return <FileIconImage />;
    if (/\.pdf$/i.test(name)) return <FileIconPDF />;
    return <FileIconGeneric />;
};

const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// ─── Folder Item ──────────────────────────────────────────────────────────────
export const FolderItem = ({ folder, onClick, onAction, viewMode }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={() => { if (!hovered) setHovered(true); }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '14px',
                cursor: 'pointer',
                userSelect: 'none',
                backgroundColor: hovered ? 'var(--blue-subtle)' : 'var(--bg-elevated)',
                border: `1px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
                // NO overflow:hidden — nothing clips children
            }}
        >
            {/* Top row: icon left, 3-dots right */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 4px 6px 12px' }}>
                {/* Clicking the icon/name area navigates */}
                <div onClick={() => onClick?.(folder.id, folder.name)} style={{ paddingTop: '2px' }}>
                    <FolderSVG active={hovered} />
                </div>
                <ItemMenu
                    isStarred={folder.is_starred}
                    viewMode={viewMode}
                    onAction={action => onAction?.(action, folder)}
                />
            </div>

            {/* Name row — also navigates */}
            <div
                onClick={() => onClick?.(folder.id, folder.name)}
                style={{ padding: '0 12px 12px 12px' }}
            >
                <span style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: hovered ? 'var(--blue-text)' : 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {folder.name}
                </span>
                {folder.is_starred && (
                    <span style={{ fontSize: '10px', color: 'var(--yellow)', marginTop: '3px', display: 'block' }}>
                        ★ Starred
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── File Item ────────────────────────────────────────────────────────────────
export const FileItem = ({ file, onDownload, onAction, viewMode }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={() => { if (!hovered) setHovered(true); }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '14px',
                // NO overflow:hidden on the outer card
                backgroundColor: 'var(--bg-elevated)',
                border: `1px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
        >
            {/* Preview area — clicks download. overflow:hidden only here, clipping the rounded corners */}
            <div
                onClick={() => onDownload?.(file.id)}
                style={{
                    aspectRatio: '4 / 3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '13px 13px 0 0',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
            >
                {getFileIcon(file.name)}
            </div>

            {/* Bottom row: name/size + 3-dots */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '8px 4px 8px 10px',
                borderTop: '1px solid var(--border-subtle)',
                borderRadius: '0 0 13px 13px',
                backgroundColor: 'var(--bg-elevated)',
                // NO overflow:hidden
            }}>
                {/* Name + size — click = download */}
                <div
                    onClick={() => onDownload?.(file.id)}
                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                >
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {file.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {formatSize(file.size)}
                    </p>
                </div>

                {/* 3-dots */}
                <ItemMenu
                    isStarred={file.is_starred}
                    viewMode={viewMode}
                    onAction={action => onAction?.(action, file)}
                />
            </div>
        </div>
    );
};