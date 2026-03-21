import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgb(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6 animate-fade-in-up"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xl)',
                }}
            >
                {/* Icon */}
                <div
                    className="w-11 h-11 mx-auto rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--red-subtle)' }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--red)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                </div>

                <h3 className="text-base font-semibold text-center mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Delete permanently?
                </h3>
                <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>"{itemName}"</span>
                    {' '}will be deleted forever and cannot be recovered.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{
                            backgroundColor: 'var(--red)',
                            boxShadow: '0 2px 10px rgb(239 68 68 / 0.35)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        Delete forever
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;