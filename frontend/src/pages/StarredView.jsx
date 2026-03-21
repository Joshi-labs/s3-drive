import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import { Spinner, Section, EmptyState } from '../components/ViewPrimitives';

const StarIconFilled = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--yellow)">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
    </svg>
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

    const handleFolderClick = (id, name) => navigate(`/drive/${id}`, {
        state: { folderName: name, source: { label: 'Starred', path: '/drive/starred' } }
    });

    const folders = items.filter(i => i.is_folder);
    const files   = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto" style={{ padding: '20px 16px 100px', backgroundColor: 'var(--bg-base)' }}>
            <style>{`@media(min-width:768px){.view-inner{padding-left:32px;padding-right:32px;}}`}</style>
            <div className="view-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef9c3' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--yellow)">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Starred</h2>
                </div>

                {loading ? <Spinner /> : (
                    <>
                        {items.length === 0 && (
                            <EmptyState
                                icon={<StarIconFilled />}
                                title="No starred items"
                                subtitle="Star files and folders to find them quickly"
                            />
                        )}
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
                )}
            </div>
        </div>
    );
};

export default StarredView;