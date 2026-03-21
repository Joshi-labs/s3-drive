import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';

const StarIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
);

const Section = ({ title, children }) => (
    <div className="mb-8 animate-fade-in">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 px-0.5" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">{children}</div>
    </div>
);

const StarredView = () => {
    const navigate = useNavigate();
    const { loading, listStarred, toggleStar, downloadFile, softDelete } = useDrive();
    const [items, setItems] = useState([]);

    const refresh = async () => {
        try {
            const data = await listStarred();
            setItems(data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1));
        } catch (e) { console.error(e); }
    };
    useEffect(() => { refresh(); }, []);

    const handleItemAction = async (action, item) => {
        if (action === 'delete') { await softDelete(item.id); refresh(); }
        else if (action === 'star') { await toggleStar(item.id); refresh(); }
        else if (action === 'copy') { navigator.clipboard.writeText(`${window.location.origin}/drive/${item.id}`); }
    };

    const handleFolderClick = (id, name) => navigate(`/drive/${id}`, { state: { folderName: name, source: { label: 'Starred', path: '/drive/starred' } } });
    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto p-5 md:p-8 pb-24" style={{ backgroundColor: 'var(--bg-base)' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fef9c3', color: 'var(--yellow)' }}>
                    <StarIcon />
                </div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Starred</h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-7 h-7 rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--blue)', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : (
                <>
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#fef9c3', color: 'var(--yellow)' }}>
                                <StarIcon />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No starred files yet</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Star files to find them quickly later</p>
                        </div>
                    )}
                    {folders.length > 0 && <Section title="Folders">{folders.map(f => <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />)}</Section>}
                    {files.length > 0 && <Section title="Files">{files.map(f => <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />)}</Section>}
                </>
            )}
        </div>
    );
};

export default StarredView;