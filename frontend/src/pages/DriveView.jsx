import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import Icons from '../components/icons';
import FloatingAddButton from '../components/FloatingAddButton';

const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
    const [folderName, setFolderName] = useState("");
    const inputRef = useRef(null);
    useEffect(() => { if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); setFolderName(""); } }, [isOpen]);
    const handleSubmit = (e) => { e.preventDefault(); if (folderName.trim()) { onCreate(folderName); onClose(); } };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">New Folder</h3>
                <form onSubmit={handleSubmit}>
                    <input ref={inputRef} type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Untitled folder" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-6 text-gray-700" />
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={!folderName.trim()} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Breadcrumbs = ({ breadcrumbs, onNavigate }) => (
    <div className="flex items-center text-sm sm:text-base text-gray-600 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar py-1">
        {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || index} className="flex items-center flex-shrink-0">
                {index > 0 && <span className="mx-2 text-gray-300">/</span>}
                <span onClick={() => onNavigate(crumb)} className={`hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-500 hover:text-blue-600'}`}>{crumb.name}</span>
            </div>
        ))}
    </div>
);

const DriveView = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const currentFolderId = folderId === 'root' || !folderId ? null : parseInt(folderId);

    const { 
        loading, isUploading, uploadProgress, uploadStatus, 
        listFiles, createFolder, softDelete, toggleStar, downloadFile, processBatchUpload 
    } = useDrive();

    const [breadcrumbs, setBreadcrumbs] = useState(() => {
        if (location.state?.source && location.state?.folderName) {
            return [{ id: 'source', name: location.state.source.label, path: location.state.source.path }, { id: currentFolderId, name: location.state.folderName }];
        }
        return [{ id: 'root', name: 'Home', path: '/drive/root' }];
    });

    useEffect(() => { if (!currentFolderId) setBreadcrumbs([{ id: 'root', name: 'Home', path: '/drive/root' }]); }, [currentFolderId]);

    const [items, setItems] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const refresh = async () => {
        const data = await listFiles(currentFolderId);
        setItems(data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1));
    };

    useEffect(() => { refresh(); }, [currentFolderId]);

    // --- OPTIMISTIC UI UPDATES (The Fix) ---
    const handleItemAction = async (action, item) => {
        if (action === 'delete') {
            // 1. Optimistic: Remove from UI immediately
            setItems(prev => prev.filter(i => i.id !== item.id));
            
            // 2. Network request in background
            await softDelete(item.id);
            refresh(); 
            
        } else if (action === 'star') {
            // 1. Optimistic: Toggle star in UI immediately
            setItems(prev => prev.map(i => 
                i.id === item.id ? { ...i, is_starred: !i.is_starred } : i
            ));

            // 2. Network request in background
            await toggleStar(item.id);
            
        } else if (action === 'copy') {
            const link = `${window.location.origin}/drive/${item.id}`; 
            navigator.clipboard.writeText(link);
            alert("Link copied!");
        }
    };

    const handleFileUpload = (files) => processBatchUpload(files, currentFolderId, refresh);

    const handleFolderClick = (id, name) => {
        const state = location.state?.source ? { source: location.state.source, folderName: name } : {};
        setBreadcrumbs(prev => [...prev, { id, name }]);
        navigate(`/drive/${id}`, { state });
    };

    const handleBreadcrumbClick = (crumb) => {
        if (crumb.path) {
            navigate(crumb.path);
        } else {
            const index = breadcrumbs.findIndex(b => b.id === crumb.id);
            const newCrumbs = breadcrumbs.slice(0, index + 1);
            setBreadcrumbs(newCrumbs);
            navigate(`/drive/${crumb.id}`, { state: location.state });
        }
    };

    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div 
            className={`h-full overflow-y-auto p-4 pb-24 md:p-8 relative scroll-smooth transition-colors duration-200 ${isDragging ? 'bg-blue-50/50 ring-4 ring-inset ring-blue-400/30' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(Array.from(e.dataTransfer.files)); }}
        >
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleFileUpload(Array.from(e.target.files))} />
            <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} onCreate={(name) => { createFolder(name, currentFolderId).then(refresh); }} />

            {isDragging && <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-blue-50/80 backdrop-blur-sm"><div className="text-center animate-bounce"><Icons.Folder className="w-20 h-20 text-blue-500 mx-auto mb-4" /><h3 className="text-2xl font-bold text-blue-600">Drop files to upload</h3></div></div>}

            <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={handleBreadcrumbClick} />

            {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div> : (
                <>
                    {folders.length > 0 && (
                        <div className="mb-8 animate-fade-in"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Folders</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">{folders.map(f => <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />)}</div></div>
                    )}
                    <div className="animate-fade-in"><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Files</h3>
                        {files.length === 0 && folders.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-gray-400"><div className="bg-gray-50 p-8 rounded-full mb-4"><Icons.Folder className="w-16 h-16 text-gray-300"/></div><p>Empty Folder</p></div> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">{files.map(f => <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />)}</div>}
                    </div>
                </>
            )}

            <FloatingAddButton onNewFolder={() => setIsFolderModalOpen(true)} onUploadClick={() => fileInputRef.current?.click()} />

            {isUploading && <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50"><div className="flex justify-between items-center mb-2"><span className="text-sm font-semibold text-gray-800 truncate pr-4">{uploadStatus}</span><span className="text-xs font-bold text-blue-600">{uploadProgress}%</span></div><div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div></div></div>}
        </div>
    );
};

export default DriveView;