import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import Icons from '../components/icons';

const RecentView = () => {
    const navigate = useNavigate();
    const { loading, listRecents, toggleStar, downloadFile, softDelete } = useDrive();
    const [items, setItems] = useState([]);

    const refresh = async () => {
        try {
            const data = await listRecents();
            setItems(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { refresh(); }, []);

    const handleItemAction = async (action, item) => {
        if (action === 'delete') {
            // CORRECTION: Direct Soft Delete (No Confirmation)
            await softDelete(item.id);
            refresh(); 
        } 
        else if (action === 'star') { 
            await toggleStar(item.id); 
            refresh(); 
        }
        else if (action === 'copy') { 
            navigator.clipboard.writeText(`${window.location.origin}/drive/${item.id}`); 
            alert("Link copied!"); 
        }
    };

    const handleFolderClick = (id, name) => {
        navigate(`/drive/${id}`, { 
            state: { 
                folderName: name,
                source: { label: 'Recent', path: '/drive/recent' } 
            } 
        });
    };

    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto p-4 pb-24 md:p-8 relative scroll-smooth">
            <div className="flex items-center mb-6 px-1 text-gray-700">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="text-xl font-bold">Recent</h2>
            </div>

            {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div> : (
                <>
                    {items.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-gray-400"><p>No recent files</p></div>}
                    
                    {folders.length > 0 && <div className="mb-8 animate-fade-in"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Folders</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">{folders.map(f => <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />)}</div></div>}
                    
                    {files.length > 0 && <div className="animate-fade-in"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Files</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">{files.map(f => <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />)}</div></div>}
                </>
            )}
        </div>
    );
};

export default RecentView;