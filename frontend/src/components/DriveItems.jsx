import React, { useState, useEffect, useRef } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const MoreIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
    </svg>
);

const FolderIcon = ({ color = 'var(--blue)' }) => (
    <svg viewBox="0 0 24 24" fill={color} className="w-9 h-9" style={{ opacity: 0.9 }}>
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
);

const FileIconGeneric = () => (
    <svg viewBox="0 0 24 24" fill="var(--blue)" className="w-8 h-8">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
);

const FileIconPDF = () => (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect width="32" height="32" rx="6" fill="#fee2e2"/>
        <path d="M8 24V8h10l6 6v10H8z" fill="#fca5a5"/>
        <path d="M18 8v6h6" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
        <text x="10" y="22" fontSize="7" fontWeight="bold" fill="#ef4444">PDF</text>
    </svg>
);

const FileIconImage = () => (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect width="32" height="32" rx="6" fill="#ecfdf5"/>
        <path d="M6 22l7-8 5 6 3-4 5 6H6z" fill="#86efac"/>
        <circle cx="22" cy="12" r="3" fill="#4ade80"/>
    </svg>
);

const TrashIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
);

const StarIcon = ({ filled }) => (
    <svg className="w-3.5 h-3.5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
);

const LinkIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
    </svg>
);

const RestoreIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
);

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
const ItemMenu = ({ onAction, isStarred, viewMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, []);

    const handleTrigger = (e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(o => !o); };
    const handleAction = (action, e) => {
        e.preventDefault(); e.stopPropagation();
        onAction?.(action);
        setIsOpen(false);
    };

    const menuItems = viewMode === 'trash'
        ? [
            { action: 'restore', label: 'Restore', icon: <RestoreIcon />, color: 'var(--green)' },
            { divider: true },
            { action: 'delete', label: 'Delete forever', icon: <TrashIcon />, color: 'var(--red)', bold: true },
        ]
        : [
            { action: 'star', label: isStarred ? 'Unstar' : 'Star', icon: <StarIcon filled={isStarred} />, color: isStarred ? 'var(--yellow)' : 'var(--text-secondary)' },
            { action: 'copy', label: 'Copy link', icon: <LinkIcon />, color: 'var(--text-secondary)' },
            { divider: true },
            { action: 'delete', label: 'Move to trash', icon: <TrashIcon />, color: 'var(--red)', bold: true },
        ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={handleTrigger}
                className="p-1.5 rounded-lg transition-all flex items-center justify-center"
                style={{
                    color: isOpen ? 'var(--text-primary)' : 'var(--text-muted)',
                    backgroundColor: isOpen ? 'var(--bg-subtle)' : 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
                <MoreIcon />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-8 w-40 rounded-xl py-1.5 z-[100] animate-fade-in-up"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    {menuItems.map((item, i) =>
                        item.divider ? (
                            <div key={i} className="divider mx-2 my-1" />
                        ) : (
                            <button
                                key={item.action}
                                onClick={e => handleAction(item.action, e)}
                                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors"
                                style={{
                                    color: item.color,
                                    fontWeight: item.bold ? 600 : 400,
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = item.action === 'delete' ? 'var(--red-subtle)' : 'var(--bg-subtle)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Folder Item ──────────────────────────────────────────────────────────────
export const FolderItem = ({ folder, onClick, onAction, viewMode }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={() => onClick?.(folder.id, folder.name)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group flex flex-col p-3.5 rounded-2xl cursor-pointer transition-all duration-150 select-none"
            style={{
                backgroundColor: hovered ? 'var(--blue-subtle)' : 'var(--bg-elevated)',
                border: `1px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
        >
            <div className="flex items-start justify-between mb-2.5">
                <FolderIcon color={hovered ? 'var(--blue)' : 'var(--text-muted)'} />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <ItemMenu isStarred={folder.is_starred} viewMode={viewMode} onAction={action => onAction?.(action, folder)} />
                </div>
            </div>
            <span className="text-xs font-medium truncate" style={{ color: hovered ? 'var(--blue-text)' : 'var(--text-primary)' }}>
                {folder.name}
            </span>
            {folder.is_starred && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-[10px]" style={{ color: 'var(--yellow)' }}>
                    <StarIcon filled /> Starred
                </span>
            )}
        </div>
    );
};

// ─── File Item ────────────────────────────────────────────────────────────────
const getFileIcon = (name) => {
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) return <FileIconImage />;
    if (/\.pdf$/i.test(name)) return <FileIconPDF />;
    return <FileIconGeneric />;
};

const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const FileItem = ({ file, onDownload, onAction, viewMode }) => {
    const [hovered, setHovered] = useState(false);
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);

    return (
        <div
            onClick={() => onDownload?.(file.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group flex flex-col rounded-2xl cursor-pointer transition-all duration-150 overflow-hidden"
            style={{
                backgroundColor: 'var(--bg-elevated)',
                border: `1px solid ${hovered ? 'var(--blue)' : 'var(--border)'}`,
                boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
        >
            {/* Preview area */}
            <div
                className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
                {isImage ? (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                        style={{ backgroundColor: 'var(--bg-muted)' }}
                    >
                        <FileIconImage />
                        <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Image</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        {getFileIcon(file.name)}
                    </div>
                )}
                {/* Hover download hint */}
                {hovered && (
                    <div
                        className="absolute inset-0 flex items-center justify-center animate-fade-in"
                        style={{ backgroundColor: 'rgb(0 0 0 / 0.35)' }}
                    >
                        <div
                            className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: 'var(--blue)' }}
                        >
                            Download
                        </div>
                    </div>
                )}
            </div>

            {/* Meta */}
            <div
                className="p-3 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
                <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatSize(file.size)}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <ItemMenu isStarred={file.is_starred} viewMode={viewMode} onAction={action => onAction?.(action, file)} />
                </div>
            </div>
        </div>
    );
};