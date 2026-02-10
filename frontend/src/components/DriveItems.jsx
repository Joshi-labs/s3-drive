import React, { useState, useEffect, useRef } from 'react';
import Icons from './icons';

// --- SHARED MENU COMPONENT ---
const ItemMenu = ({ onAction, isStarred, viewMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    const handleTrigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleAction = (action, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAction) onAction(action);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={handleTrigger}
                className={`p-2 -mr-2 rounded-full transition-colors active:bg-gray-100 ${isOpen ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Icons.MoreVertical />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-8 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[100] animate-fade-in flex flex-col overflow-hidden">
                    
                    {/* TRASH MODE MENU */}
                    {viewMode === 'trash' ? (
                        <>
                            <button 
                                onClick={(e) => handleAction('restore', e)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-100 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                <span>Restore</span>
                            </button>
                            <div className="h-px bg-gray-100 mx-2"></div>
                            <button 
                                onClick={(e) => handleAction('delete', e)}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 active:bg-red-50 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                            >
                                <Icons.Trash className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        </>
                    ) : (
                        /* STANDARD MENU */
                        <>
                            <button 
                                onClick={(e) => handleAction('star', e)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-100 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Icons.Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                <span>{isStarred ? 'Unstar' : 'Star'}</span>
                            </button>

                            <button 
                                onClick={(e) => handleAction('copy', e)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 active:bg-gray-100 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Icons.Link className="w-4 h-4 text-gray-400" />
                                <span>Copy</span>
                            </button>

                            <div className="h-px bg-gray-100 mx-2"></div>

                            <button 
                                onClick={(e) => handleAction('delete', e)}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 active:bg-red-50 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                            >
                                <Icons.Trash className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// --- FOLDER ITEM ---
export const FolderItem = ({ folder, onClick, onAction, viewMode }) => (
    <div 
        onClick={() => onClick && onClick(folder.id, folder.name)}
        className="group flex flex-col p-4 bg-white border border-gray-200 rounded-2xl active:bg-blue-50/50 active:border-blue-200 cursor-pointer transition-all duration-200 select-none relative"
    >
        <div className="flex items-center justify-between mb-3">
             <Icons.Folder className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
             <ItemMenu 
                isStarred={folder.is_starred} 
                viewMode={viewMode}
                onAction={(action) => onAction && onAction(action, folder)} 
             />
        </div>
        <span className="text-sm font-medium text-gray-700 truncate">{folder.name}</span>
    </div>
);

// --- FILE ITEM ---
export const FileItem = ({ file, onDownload, onAction, viewMode }) => {
    const getIcon = () => {
        if(file.name.match(/\.(jpg|jpeg|png|gif)$/i)) return <Icons.Image className="w-8 h-8 mb-2" />;
        if(file.name.match(/\.pdf$/i)) return <Icons.PDF className="w-8 h-8 mb-2" />;
        return <Icons.File className="w-8 h-8 mb-2" />;
    };

    return (
        <div 
            onClick={() => onDownload && onDownload(file.id)}
            className="group bg-white border border-gray-200 rounded-2xl active:shadow-md cursor-pointer transition-all duration-200 flex flex-col relative"
        >
             <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-t-2xl">
                {file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                   <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
                       <span className="text-xs font-medium uppercase tracking-wider">Image</span>
                   </div>
                ) : (
                    getIcon()
                )}
             </div>

             <div className="p-3.5 bg-white border-t border-gray-50 flex items-center justify-between rounded-b-2xl">
                <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                
                <ItemMenu 
                    isStarred={file.is_starred} 
                    viewMode={viewMode}
                    onAction={(action) => onAction && onAction(action, file)} 
                />
             </div>
        </div>
    );
};