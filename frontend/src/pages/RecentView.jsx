// RecentView.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';

const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
);

const Section = ({ title, children }) => (
    <div className="mb-8 animate-fade-in">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 px-0.5" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">{children}</div>
    </div>
);

const Skeleton = () => (
    <div className="mb-8">
        <div className="skeleton h-3 w-16 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton rounded-2xl" style={{ aspectRatio: '1/1.1' }} />)}
        </div>
    </div>
);

const RecentView = () => {
    const navigate = useNavigate();
    const { loading, listRecents, toggleStar, downloadFile, softDelete } = useDrive();
    const [items, setItems] = useState([]);

    const refresh = async () => { try { setItems(await listRecents()); } catch (e) { console.error(e); } };
    useEffect(() => { refresh(); }, []);

    const handleItemAction = async (action, item) => {
        if (action === 'delete') { await softDelete(item.id); refresh(); }
        else if (action === 'star') { await toggleStar(item.id); refresh(); }
        else if (action === 'copy') { navigator.clipboard.writeText(`${window.location.origin}/drive/${item.id}`); }
    };

    const handleFolderClick = (id, name) => navigate(`/drive/${id}`, { state: { folderName: name, source: { label: 'Recent', path: '/drive/recent' } } });
    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto p-5 md:p-8 pb-24" style={{ backgroundColor: 'var(--bg-base)' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--blue-subtle)', color: 'var(--blue)' }}>
                    <ClockIcon />
                </div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent</h2>
            </div>

            {loading ? <><Skeleton /><Skeleton /></> : (
                <>
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                <ClockIcon />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No recent activity</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Files you open or upload will appear here</p>
                        </div>
                    )}
                    {folders.length > 0 && <Section title="Folders">{folders.map(f => <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />)}</Section>}
                    {files.length > 0 && <Section title="Files">{files.map(f => <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />)}</Section>}
                </>
            )}
        </div>
    );
};

export default RecentView;