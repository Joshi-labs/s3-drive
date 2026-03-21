import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import FloatingAddButton from '../components/FloatingAddButton';
import { Spinner, Section, EmptyState } from '../components/ViewPrimitives';

// ─── Create Folder Modal ──────────────────────────────────────────────────────
const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
    const [folderName, setFolderName] = useState('');
    const inputRef = useRef(null);
    useEffect(() => {
        if (isOpen) { setFolderName(''); setTimeout(() => inputRef.current?.focus(), 80); }
    }, [isOpen]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (folderName.trim()) { onCreate(folderName.trim()); onClose(); }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgb(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-sm rounded-2xl p-6 animate-fade-in-up"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
                <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Folder</h3>
                <form onSubmit={handleSubmit}>
                    <input ref={inputRef} type="text" value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                        placeholder="Untitled folder" className="input-base mb-5" />
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-ghost px-4">Cancel</button>
                        <button type="submit" disabled={!folderName.trim()} className="btn-primary px-5">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────
const Breadcrumbs = ({ breadcrumbs, onNavigate }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id ?? index}>
                {index > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '13px', flexShrink: 0 }}>/</span>}
                <button
                    onClick={() => onNavigate(crumb)}
                    style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                        color: index === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: index === breadcrumbs.length - 1 ? 'var(--bg-subtle)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background-color 0.12s, color 0.12s',
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
    <div className="fixed bottom-6 right-6 left-6 md:left-auto animate-fade-in-up"
        style={{ maxWidth: '320px', borderRadius: '14px', padding: '14px 16px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{status}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>{progress}%</span>
        </div>
        <div style={{ height: '3px', borderRadius: '2px', backgroundColor: 'var(--bg-muted)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '2px', backgroundColor: 'var(--blue)', width: `${progress}%`, transition: 'width 0.25s ease' }} />
        </div>
    </div>
);

// ─── Folder icon for empty state ──────────────────────────────────────────────
const FolderIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--text-muted)">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
);

// ─── DriveView ────────────────────────────────────────────────────────────────
const DriveView = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const currentFolderId = folderId === 'root' || !folderId ? null : parseInt(folderId);

    const { loading, isUploading, uploadProgress, uploadStatus, listFiles, createFolder, softDelete, toggleStar, downloadFile, processBatchUpload } = useDrive();

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
        const sorted = data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1);

        // DEBUG: log what the API returns for is_starred
        console.group('[DriveView] API response (root)');
        sorted.forEach(item => {
            console.log(
                (item.is_folder ? '📁' : '📄') +
                ' id=' + item.id +
                '  is_starred=' + item.is_starred +
                '  name="' + item.name + '"'
            );
        });
        const starred = sorted.filter(i => i.is_starred);
        console.log('Starred count: ' + starred.length);
        starred.forEach(i => console.log('  STARRED -> id=' + i.id + ' name="' + i.name + '"'));
        console.groupEnd();
        // END DEBUG

        setItems(sorted);
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
    const files   = items.filter(i => !i.is_folder);

    return (
        <div
            className="h-full overflow-y-auto"
            style={{
                padding: '20px 16px 100px',
                overflowX: 'hidden',
                backgroundColor: isDragging ? 'var(--blue-subtle)' : 'var(--bg-base)',
                outline: isDragging ? '2px dashed var(--blue)' : 'none',
                outlineOffset: '-8px',
                transition: 'background-color 0.15s',
                position: 'relative',
            }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={e => {
                e.preventDefault(); setIsDragging(false);
                processBatchUpload(Array.from(e.dataTransfer.files), currentFolderId, refresh);
            }}
        >
            {/* Responsive padding on larger screens */}
            <style>{`@media(min-width:768px){.drive-inner{padding-left:32px;padding-right:32px;}}`}</style>

            <input type="file" ref={fileInputRef} className="hidden" multiple
                onChange={e => processBatchUpload(Array.from(e.target.files), currentFolderId, refresh)} />
            <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)}
                onCreate={name => createFolder(name, currentFolderId).then(refresh)} />

            {/* Drag overlay */}
            {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-fade-in"
                    style={{ backgroundColor: 'rgb(59 130 246 / 0.05)' }}>
                    <div style={{ padding: '40px 48px', borderRadius: '20px', textAlign: 'center', backgroundColor: 'var(--bg-elevated)', border: '2px dashed var(--blue)', boxShadow: 'var(--shadow-lg)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" width="48" height="48" style={{ margin: '0 auto 12px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--blue)', margin: 0 }}>Drop to upload</p>
                    </div>
                </div>
            )}

            <div className="drive-inner">
                <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={handleBreadcrumbClick} />

                {loading ? <Spinner /> : (
                    folders.length === 0 && files.length === 0 ? (
                        <EmptyState
                            icon={<FolderIcon />}
                            title="This folder is empty"
                            subtitle="Upload files or create a folder to get started"
                            actions={<>
                                <button onClick={() => setIsFolderModalOpen(true)} className="btn-ghost" style={{ border: '1px solid var(--border)', fontSize: '13px', padding: '8px 16px' }}>New Folder</button>
                                <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>Upload File</button>
                            </>}
                        />
                    ) : (
                        <>
                            {folders.length > 0 && (
                                <Section title="Folders" count={folders.length}>
                                    {folders.map(f => <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />)}
                                </Section>
                            )}
                            {files.length > 0 && (
                                <Section title="Files" count={files.length}>
                                    {files.map(f => <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />)}
                                </Section>
                            )}
                        </>
                    )
                )}
            </div>

            <FloatingAddButton onNewFolder={() => setIsFolderModalOpen(true)} onUploadClick={() => fileInputRef.current?.click()} />
            {isUploading && <UploadProgress status={uploadStatus} progress={uploadProgress} />}
        </div>
    );
};

export default DriveView;