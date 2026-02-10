import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import Icons from '../components/icons';

const StarredView = () => {
    const navigate = useNavigate();
    const { loading, listStarred, toggleStar, downloadFile, softDelete } = useDrive();
    const [items, setItems] = useState([]);

    const refresh = async () => {
        try {
            const data = await listStarred();
            // Sort: Folders first
            const sorted = data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1);
            setItems(sorted);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { refresh(); }, []);

    // --- ACTIONS ---
    const handleItemAction = async (action, item) => {
if (action === 'delete') {
            // UPDATED: Instant Soft Delete (No Confirmation)
            await softDelete(item.id);
            refresh(); // Item removes from list immediately
        } 
        else if (action === 'star') {
            await toggleStar(item.id);
            refresh(); 
        }
        else if (action === 'copy') {
            const link = `${window.location.origin}/drive/${item.id}`; 
            navigator.clipboard.writeText(link);
            alert("Link copied!");
        }
    };

    // --- DYNAMIC NAV ---
    const handleFolderClick = (id, name) => {
        navigate(`/drive/${id}`, { 
            state: { 
                folderName: name,
                source: { label: 'Starred', path: '/drive/starred' } // <--- THE MAGIC
            } 
        });
    };

    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto p-4 pb-24 md:p-8 relative scroll-smooth">
            <div className="flex items-center mb-6 px-1 text-gray-700">
                <Icons.Star className="w-6 h-6 mr-3 text-yellow-400 fill-yellow-400" />
                <h2 className="text-xl font-bold">Starred</h2>
            </div>

            {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div> : (
                <>
                    {items.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-gray-400"><div className="bg-yellow-50 p-6 rounded-full mb-4"><Icons.Star className="w-12 h-12 text-yellow-400 fill-yellow-400" /></div><p>No starred files</p></div>}

                    {folders.length > 0 && <div className="mb-8 animate-fade-in"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Folders</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">{folders.map(f => <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />)}</div></div>}

                    {files.length > 0 && <div className="animate-fade-in"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Files</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">{files.map(f => <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />)}</div></div>}
                </>
            )}
        </div>
    );
};

export default StarredView;