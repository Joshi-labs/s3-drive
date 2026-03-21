import React, { useEffect, useState } from 'react';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Spinner, Section, EmptyState } from '../components/ViewPrimitives';

const TrashIconEmpty = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--text-muted)" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
);

const TrashView = () => {
    const { loading, listTrash, restoreItem, hardDelete } = useDrive();
    const [items, setItems] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const refresh = async () => {
        try {
            const data = await listTrash();
            setItems(data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1));
        } catch (e) { console.error(e); }
    };
    useEffect(() => { refresh(); }, []);

    const handleAction = async (action, item) => {
        if (action === 'restore') { await restoreItem(item.id); refresh(); }
        else if (action === 'delete') { setItemToDelete(item); setIsDeleteModalOpen(true); }
    };

    const executeHardDelete = async () => {
        if (itemToDelete) {
            await hardDelete(itemToDelete.id);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            refresh();
        }
    };

    const folders = items.filter(i => i.is_folder);
    const files   = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto" style={{ padding: '20px 16px 100px', overflowX: 'hidden', backgroundColor: 'var(--bg-base)' }}>
            <style>{`@media(min-width:768px){.view-inner{padding-left:32px;padding-right:32px;}}`}</style>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                onConfirm={executeHardDelete}
                itemName={itemToDelete?.name || 'this item'}
            />

            <div className="view-inner">
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--red-subtle)' }}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--red)" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Trash</h2>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, paddingLeft: '44px' }}>
                        Items are permanently deleted after 30 days
                    </p>
                </div>

                {loading ? <Spinner /> : (
                    <>
                        {items.length === 0 && (
                            <EmptyState
                                icon={<TrashIconEmpty />}
                                title="Trash is empty"
                                subtitle="Deleted files will appear here"
                            />
                        )}
                        {folders.length > 0 && (
                            <Section title="Folders" count={folders.length}>
                                {folders.map(f => (
                                    <FolderItem key={f.id} folder={f} viewMode="trash"
                                        onClick={() => {}} onAction={handleAction} />
                                ))}
                            </Section>
                        )}
                        {files.length > 0 && (
                            <Section title="Files" count={files.length}>
                                {files.map(f => (
                                    <FileItem key={f.id} file={f} viewMode="trash"
                                        onDownload={() => {}} onAction={handleAction} />
                                ))}
                            </Section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TrashView;