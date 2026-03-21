import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import { Spinner, Section, EmptyState } from '../components/ViewPrimitives';

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--text-muted)" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
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

    const handleFolderClick = (id, name) => navigate(`/drive/${id}`, {
        state: { folderName: name, source: { label: 'Recent', path: '/drive/recent' } }
    });

    const folders = items.filter(i => i.is_folder);
    const files   = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto" style={{ padding: '20px 16px 100px', backgroundColor: 'var(--bg-base)' }}>
            <style>{`@media(min-width:768px){.view-inner{padding-left:32px;padding-right:32px;}}`}</style>
            <div className="view-inner">
                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--blue-subtle)' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--blue)" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent</h2>
                </div>

                {loading ? <Spinner /> : (
                    <>
                        {items.length === 0 && (
                            <EmptyState
                                icon={<ClockIcon />}
                                title="No recent activity"
                                subtitle="Files you open or upload will appear here"
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

export default RecentView;