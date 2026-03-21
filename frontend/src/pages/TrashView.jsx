import React, { useEffect, useState } from 'react';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
);

const Section = ({ title, children }) => (
    <div className="mb-8 animate-fade-in">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 px-0.5" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">{children}</div>
    </div>
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
        if (action === 'restore') {
            await restoreItem(item.id);
            refresh();
        } else if (action === 'delete') {
            setItemToDelete(item);
            setIsDeleteModalOpen(true);
        }
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
    const files = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto p-5 md:p-8 pb-24" style={{ backgroundColor: 'var(--bg-base)' }}>
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                onConfirm={executeHardDelete}
                itemName={itemToDelete?.name || 'this item'}
            />

            <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--red-subtle)', color: 'var(--red)' }}>
                    <TrashIcon />
                </div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Trash</h2>
            </div>
            <p className="text-xs mb-6 ml-11" style={{ color: 'var(--text-muted)' }}>
                Items here are permanently deleted after 30 days
            </p>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-7 h-7 rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--blue)', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : (
                <>
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            >
                                <TrashIcon />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Trash is empty</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Deleted files will appear here</p>
                        </div>
                    )}

                    {folders.length > 0 && (
                        <Section title="Folders">
                            {folders.map(f => (
                                <FolderItem
                                    key={f.id}
                                    folder={f}
                                    viewMode="trash"
                                    onClick={() => {}}
                                    onAction={handleAction}
                                />
                            ))}
                        </Section>
                    )}

                    {files.length > 0 && (
                        <Section title="Files">
                            {files.map(f => (
                                <FileItem
                                    key={f.id}
                                    file={f}
                                    viewMode="trash"
                                    onDownload={() => {}}
                                    onAction={handleAction}
                                />
                            ))}
                        </Section>
                    )}
                </>
            )}
        </div>
    );
};

export default TrashView;