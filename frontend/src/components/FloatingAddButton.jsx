import React, { useState } from 'react';

const PlusIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
    </svg>
);

const FolderPlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    </svg>
);

const UploadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
    </svg>
);

const FloatingAddButton = ({ onNewFolder, onUploadClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { label: 'New Folder', icon: <FolderPlusIcon />, onClick: () => { setIsOpen(false); onNewFolder?.(); } },
        { label: 'Upload File', icon: <UploadIcon />, onClick: () => { setIsOpen(false); onUploadClick?.(); } },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />

                    {actions.map((action, i) => (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in-up transition-all"
                            style={{
                                animationDelay: `${i * 40}ms`,
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-lg)',
                                color: 'var(--text-primary)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <span style={{ color: 'var(--blue)' }}>{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </>
            )}

            <button
                onClick={() => setIsOpen(o => !o)}
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all duration-200"
                style={{
                    width: '52px', height: '52px',
                    backgroundColor: isOpen ? 'var(--bg-elevated)' : 'var(--blue)',
                    color: isOpen ? 'var(--text-primary)' : '#fff',
                    border: isOpen ? '1px solid var(--border)' : 'none',
                    boxShadow: isOpen ? 'var(--shadow-md)' : '0 4px 20px rgb(59 130 246 / 0.45)',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.transform = 'none'; }}
            >
                <PlusIcon />
            </button>
        </div>
    );
};

export default FloatingAddButton;