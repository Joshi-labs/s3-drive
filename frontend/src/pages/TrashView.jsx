import React, { useEffect, useState } from 'react';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import Icons from '../components/icons';
import DeleteConfirmModal from '../components/DeleteConfirmModal'; // Import Modal

const TrashView = () => {
    const { loading, listTrash, restoreItem, hardDelete } = useDrive();
    const [items, setItems] = useState([]);
    
    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const refresh = async () => {
        try {
            const data = await listTrash();
            setItems(data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1));
        } catch (e) { console.error(e); }
    };

    useEffect(() => { refresh(); }, []);

    // --- ACTIONS ---
    const handleAction = async (action, item) => {
        if (action === 'restore') {
            await restoreItem(item.id);
            refresh();
        } else if (action === 'delete') {
            // CORRECTION: Open Custom Modal for Hard Delete
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
        <div className="h-full overflow-y-auto p-4 pb-24 md:p-8 relative scroll-smooth">
            
            {/* Hard Delete Modal */}
            <DeleteConfirmModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeHardDelete}
                itemName={itemToDelete?.name || "this item"}
            />

            <div className="flex items-center mb-6 px-1 text-gray-700">
                <Icons.Trash className="w-6 h-6 mr-3 text-red-500" />
                <h2 className="text-xl font-bold">Trash</h2>
                <span className="ml-4 hidden sm:inline text-sm text-gray-400 font-normal">Items deleted forever after 30 days</span>
            </div>

            {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div> : (
                <>
                    {items.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-gray-400"><div className="bg-gray-50 p-8 rounded-full mb-4"><Icons.Trash className="w-16 h-16 text-gray-300" /></div><p>Trash is empty</p></div>}

                    {folders.length > 0 && <div className="mb-8 animate-fade-in"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Folders</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {folders.map(f => (
                            <FolderItem 
                                key={f.id} 
                                folder={f} 
                                viewMode="trash" 
                                onClick={() => {}} // No Nav in Trash
                                onAction={handleAction} 
                            />
                        ))}
                    </div></div>}

                    <div className="animate-fade-in">
                        {files.length > 0 && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Files</h3>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {files.map(f => (
                                <FileItem 
                                    key={f.id} 
                                    file={f} 
                                    viewMode="trash" 
                                    onDownload={() => {}} 
                                    onAction={handleAction} 
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrashView;