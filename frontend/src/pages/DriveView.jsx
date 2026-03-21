import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import FloatingAddButton from '../components/FloatingAddButton';

// ─── Create Folder Modal ──────────────────────────────────────────────────────
const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
    const [folderName, setFolderName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFolderName('');
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (folderName.trim()) { onCreate(folderName.trim()); onClose(); }
    };

    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Folder</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                        placeholder="Untitled folder"
                        className="input-base mb-5"
                    />
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-ghost px-4">Cancel</button>
                        <button
                            type="submit"
                            disabled={!folderName.trim()}
                            className="btn-primary px-5"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────
const Breadcrumbs = ({ breadcrumbs, onNavigate }) => (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar py-0.5">
        {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || index}>
                {index > 0 && (
                    <span className="mx-1 text-xs" style={{ color: 'var(--text-muted)' }}>/</span>
                )}
                <button
                    onClick={() => onNavigate(crumb)}
                    className="px-2.5 py-1 rounded-lg text-sm transition-colors flex-shrink-0"
                    style={{
                        color: index === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                        backgroundColor: index === breadcrumbs.length - 1 ? 'var(--bg-subtle)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (index < breadcrumbs.length - 1) { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--blue)'; } }}
                    onMouseLeave={e => { if (index < breadcrumbs.length - 1) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                >
                    {crumb.name}
                </button>
            </React.Fragment>
        ))}
    </div>
);

// ─── Upload Progress ──────────────────────────────────────────────────────────
const UploadProgress = ({ status, progress }) => (
    <div
        className="fixed bottom-6 right-6 left-6 md:left-auto md:w-80 rounded-xl p-4 z-50 animate-fade-in-up"
        style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
        }}
    >
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium truncate pr-3" style={{ color: 'var(--text-secondary)' }}>{status}</span>
            <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--blue)' }}>{progress}%</span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', backgroundColor: 'var(--bg-muted)' }}>
            <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: 'var(--blue)' }}
            />
        </div>
    </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ onUpload, onNewFolder }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
        >
            <svg viewBox="0 0 24 24" fill="var(--text-muted)" className="w-10 h-10">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>This folder is empty</p>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Upload files or create a new folder to get started</p>
        <div className="flex gap-3">
            <button onClick={onNewFolder} className="btn-ghost text-xs px-4 py-2" style={{ border: '1px solid var(--border)' }}>New Folder</button>
            <button onClick={onUpload} className="btn-primary text-xs px-4 py-2">Upload File</button>
        </div>
    </div>
);

// ─── Section ──────────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
    <div className="mb-8 animate-fade-in">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 px-0.5" style={{ color: 'var(--text-muted)' }}>
            {title}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {children}
        </div>
    </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonGrid = () => (
    <div className="mb-8">
        <div className="skeleton h-3 w-16 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl" style={{ aspectRatio: '1 / 1.1' }} />
            ))}
        </div>
    </div>
);

// ─── DriveView ────────────────────────────────────────────────────────────────
const DriveView = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const currentFolderId = folderId === 'root' || !folderId ? null : parseInt(folderId);

    const {
        loading, isUploading, uploadProgress, uploadStatus,
        listFiles, createFolder, softDelete, toggleStar, downloadFile, processBatchUpload
    } = useDrive();

    const [breadcrumbs, setBreadcrumbs] = useState(() => {
        if (location.state?.source && location.state?.folderName) {
            return [
                { id: 'source', name: location.state.source.label, path: location.state.source.path },
                { id: currentFolderId, name: location.state.folderName },
            ];
        }
        return [{ id: 'root', name: 'My Drive', path: '/drive/root' }];
    });

    useEffect(() => {
        if (!currentFolderId) setBreadcrumbs([{ id: 'root', name: 'My Drive', path: '/drive/root' }]);
    }, [currentFolderId]);

    const [items, setItems] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const refresh = async () => {
        const data = await listFiles(currentFolderId);
        setItems(data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1));
    };
    useEffect(() => { refresh(); }, [currentFolderId]);

    const handleItemAction = async (action, item) => {
        if (action === 'delete') {
            setItems(prev => prev.filter(i => i.id !== item.id));
            await softDelete(item.id);
            refresh();
        } else if (action === 'star') {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_starred: !i.is_starred } : i));
            await toggleStar(item.id);
        } else if (action === 'copy') {
            navigator.clipboard.writeText(`${window.location.origin}/drive/${item.id}`);
        }
    };

    const handleFolderClick = (id, name) => {
        setBreadcrumbs(prev => [...prev, { id, name }]);
        navigate(`/drive/${id}`);
    };

    const handleBreadcrumbClick = (crumb) => {
        if (crumb.path) {
            navigate(crumb.path);
        } else {
            const idx = breadcrumbs.findIndex(b => b.id === crumb.id);
            setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
            navigate(`/drive/${crumb.id}`);
        }
    };

    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div
            className={`h-full overflow-y-auto p-5 md:p-8 pb-24 relative transition-all duration-200`}
            style={{
                backgroundColor: isDragging ? 'var(--blue-subtle)' : 'var(--bg-base)',
                outline: isDragging ? '2px dashed var(--blue)' : 'none',
                outlineOffset: '-8px',
            }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                processBatchUpload(Array.from(e.dataTransfer.files), currentFolderId, refresh);
            }}
        >
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={e => processBatchUpload(Array.from(e.target.files), currentFolderId, refresh)} />
            <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} onCreate={name => createFolder(name, currentFolderId).then(refresh)} />

            {/* Drag overlay */}
            {isDragging && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none animate-fade-in"
                    style={{ backgroundColor: 'rgb(59 130 246 / 0.08)' }}
                >
                    <div
                        className="p-8 rounded-3xl text-center"
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '2px dashed var(--blue)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        <p className="text-base font-semibold" style={{ color: 'var(--blue)' }}>Drop to upload</p>
                    </div>
                </div>
            )}

            <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={handleBreadcrumbClick} />

            {loading ? (
                <>
                    <SkeletonGrid />
                    <SkeletonGrid />
                </>
            ) : (
                <>
                    {folders.length === 0 && files.length === 0 ? (
                        <EmptyState
                            onUpload={() => fileInputRef.current?.click()}
                            onNewFolder={() => setIsFolderModalOpen(true)}
                        />
                    ) : (
                        <>
                            {folders.length > 0 && (
                                <Section title="Folders">
                                    {folders.map(f => (
                                        <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />
                                    ))}
                                </Section>
                            )}
                            {files.length > 0 && (
                                <Section title="Files">
                                    {files.map(f => (
                                        <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />
                                    ))}
                                </Section>
                            )}
                        </>
                    )}
                </>
            )}

            <FloatingAddButton
                onNewFolder={() => setIsFolderModalOpen(true)}
                onUploadClick={() => fileInputRef.current?.click()}
            />

            {isUploading && <UploadProgress status={uploadStatus} progress={uploadProgress} />}
        </div>
    );
};

export default DriveView;