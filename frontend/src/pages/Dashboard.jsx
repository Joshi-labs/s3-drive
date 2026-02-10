import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icons from '../components/icons';
import FloatingAddButton from '../components/FloatingAddButton.jsx';
import DriveSidebar from '../components/DriveSidebar.jsx';
import DriveNavbar from '../components/DriveNavbar.jsx';

import Logo from '../assets/logo.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// --- COMPONENT: CREATE FOLDER MODAL ---
const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
    const [folderName, setFolderName] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setFolderName("");
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (folderName.trim()) {
            onCreate(folderName);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">New Folder</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder="Untitled folder"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-6 text-gray-700"
                    />
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={!folderName.trim()} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- ITEM COMPONENTS ---
const FolderItem = ({ folder, onClick, onDelete }) => (
    <div 
        onClick={() => onClick(folder.id, folder.name)}
        className="group flex flex-col p-4 bg-white border border-gray-200 rounded-2xl hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all duration-200 select-none active:scale-95 relative"
    >
        <div className="flex items-center justify-between mb-3">
             <Icons.Folder className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
             <button onClick={(e) => onDelete(folder.id, folder.name, e)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete Folder">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
        </div>
        <span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">{folder.name}</span>
    </div>
);

const FileItem = ({ file, onDownload, onDelete }) => {
    const getIcon = () => {
        if(file.name.match(/\.(jpg|jpeg|png|gif)$/i)) return <Icons.Image className="w-8 h-8 mb-2" />;
        if(file.name.match(/\.pdf$/i)) return <Icons.PDF className="w-8 h-8 mb-2" />;
        return <Icons.File className="w-8 h-8 mb-2" />;
    };

    return (
        <div onClick={() => onDownload(file.id)} className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all duration-200 flex flex-col active:scale-[0.98]">
             <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                {file.type === 'image' || file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                   <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400"><span className="text-xs font-medium uppercase tracking-wider">Image</span></div>
                ) : getIcon()}
             </div>
             <div className="p-3.5 bg-white border-t border-gray-50 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={(e) => onDelete(file.id, file.name, e)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete File">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
        </div>
    );
};

const Breadcrumbs = ({ breadcrumbs, onNavigate }) => (
    <div className="flex items-center text-sm sm:text-base text-gray-600 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar py-1">
        {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || index} className="flex items-center flex-shrink-0">
                {index > 0 && <span className="mx-2 text-gray-300">/</span>}
                <span onClick={() => onNavigate(index, crumb.id)} className={`hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-500 hover:text-blue-600'}`}>
                    {crumb.name}
                </span>
            </div>
        ))}
    </div>
);

// --- MAIN DASHBOARD ---

const Dashboard = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // State
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [breadcrumbs, setBreadcrumbs] = useState([{id: 'root', name: 'Home'}]);
    
    // UI State for Drag & Drop
    const [isDragging, setIsDragging] = useState(false);

    // Modal & Upload State
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("");

    const currentFolderId = folderId === 'root' || !folderId ? null : parseInt(folderId);

    // --- HELPER: AUTH FETCH ---
    const authFetch = async (endpoint, options = {}) => {
        const token = localStorage.getItem("drive_token");
        if (!token) throw new Error("No token found");
        const url = `${API_BASE}${endpoint}`;
        const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("drive_token");
            navigate('/login');
            throw new Error("Session expired");
        }
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || res.statusText);
        }
        return res;
    };

    const refreshList = async () => {
        setLoading(true);
        try {
            const query = currentFolderId ? `?parentId=${currentFolderId}` : '';
            const res = await authFetch(`/api/files${query}`);
            const data = await res.json();
            const sorted = data.sort((a, b) => (a.is_folder === b.is_folder) ? 0 : a.is_folder ? -1 : 1);
            setItems(sorted);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(!localStorage.getItem("drive_token")) {
            navigate('/login');
            return;
        }
        refreshList();
    }, [currentFolderId]);

    // --- ACTIONS ---

    const handleCreateFolder = async (name) => {
        try {
            await authFetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, parentId: currentFolderId })
            });
            refreshList();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleDelete = async (id, name, e) => {
        if (e) e.stopPropagation();
        if (!confirm(`⚠️ Delete "${name}"? This cannot be undone.`)) return;
        try {
            await authFetch(`/api/delete?id=${id}`, { method: 'DELETE' });
            refreshList();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await authFetch(`/api/download?id=${id}`);
            const data = await res.json();
            window.open(data.downloadUrl, '_blank');
        } catch (e) {
            alert(e.message);
        }
    };

    // --- NEW: CORE UPLOAD LOGIC (Single File) ---
    const uploadSingleFile = async (file) => {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Init
                const initRes = await authFetch('/api/upload-init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, size: file.size, parentId: currentFolderId })
                });
                const initData = await initRes.json();

                // 2. Upload (XHR)
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', initData.uploadUrl, true);
                xhr.upload.onprogress = (ev) => {
                    if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                };
                xhr.onload = async () => {
                    if (xhr.status === 200) {
                         // 3. Finalize
                         try {
                            await authFetch('/api/upload-finalize', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fileId: initData.fileId })
                            });
                            resolve();
                         } catch (err) { reject(err); }
                    } else {
                        reject(new Error("Upload failed"));
                    }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send(file);
            } catch (err) {
                reject(err);
            }
        });
    };

    // --- NEW: BATCH PROCESSOR ---
    const processBatchUpload = async (files) => {
        if (files.length === 0) return;
        if (files.length > 10) {
            alert("⚠️ Maximum 10 files allowed at once.");
            return;
        }

        setIsUploading(true);
        
        // Loop sequentially
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(0);
            setUploadStatus(`Uploading (${i + 1}/${files.length}): ${file.name}`);
            
            try {
                await uploadSingleFile(file);
            } catch (error) {
                console.error(`Failed to upload ${file.name}`, error);
                alert(`Error uploading ${file.name}: ${error.message}`);
                // Continue to next file even if one fails
            }
        }

        setUploadStatus("Done!");
        setTimeout(() => {
            setIsUploading(false);
            refreshList();
        }, 1000);
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- NEW: DRAG & DROP HANDLERS ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processBatchUpload(files);
    };

    // Helper for FAB input
    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        processBatchUpload(files);
    };


    // --- NAV ---
    const handleFolderClick = (id, name) => {
        setBreadcrumbs(prev => [...prev, { id, name }]);
        navigate(`/drive/${id}`);
    };

    const handleBreadcrumbClick = (index, id) => {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
        if(id === 'root') navigate('/drive/root');
        else navigate(`/drive/${id}`);
    };

    const handleRootNav = () => {
        setBreadcrumbs([{id: 'root', name: 'Home'}]);
        navigate('/drive/root');
        setMobileMenuOpen(false);
    };

    const folders = items.filter(item => item.is_folder);
    const files = items.filter(item => !item.is_folder);

    return (
        <div className="flex flex-col h-screen bg-white font-sans text-gray-900">
            {/* Hidden Input & Modals */}
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileInputChange} />
            <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} onCreate={handleCreateFolder} />

            <DriveNavbar onMenuClick={() => setMobileMenuOpen(true)} />
            
            <div className="flex flex-1 overflow-hidden">
                <DriveSidebar isOpen={mobileMenuOpen} closeMenu={() => setMobileMenuOpen(false)} navigateToRoot={handleRootNav} />
                
                {/* MAIN CONTENT AREA 
                   Added Drop handlers here so dropping anywhere on the list works 
                */}
                <main 
                    className={`flex-1 overflow-y-auto bg-white p-4 pb-24 md:p-8 relative scroll-smooth transition-colors duration-200 ${isDragging ? 'bg-blue-50/50 ring-4 ring-inset ring-blue-400/30' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    
                    {/* Visual Cue for Dragging */}
                    {isDragging && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-blue-50/80 backdrop-blur-sm">
                             <div className="text-center animate-bounce">
                                <Icons.Folder className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-blue-600">Drop files to upload</h3>
                                <p className="text-blue-500 mt-2">Maximum 10 files at once</p>
                             </div>
                        </div>
                    )}

                    <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={handleBreadcrumbClick} />

                    {loading ? (
                         <div className="flex justify-center py-20">
                             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                    ) : (
                        <>
                            {folders.length > 0 && (
                                <div className="mb-8 animate-fade-in">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Folders</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                        {folders.map(folder => (
                                            <FolderItem key={folder.id} folder={folder} onClick={handleFolderClick} onDelete={handleDelete} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="animate-fade-in">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Files</h3>
                                {files.length === 0 && folders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <div className="bg-gray-50 p-8 rounded-full mb-4 ring-1 ring-gray-100">
                                            <Icons.Folder className="w-16 h-16 text-gray-300"/>
                                        </div>
                                        <p className="text-lg font-medium text-gray-500">Empty Folder</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                        {files.map(file => (
                                            <FileItem key={file.id} file={file} onDownload={handleDownload} onDelete={handleDelete} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <FloatingAddButton onNewFolder={() => setIsFolderModalOpen(true)} onUploadClick={() => fileInputRef.current?.click()} />

                    {/* Enhanced Upload Progress */}
                    {isUploading && (
                        <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-800 truncate pr-4">{uploadStatus}</span>
                                <span className="text-xs font-bold text-blue-600">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out" style={{width: `${uploadProgress}%`}}></div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;