import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "https://s3-drive.vpjoshi.in"; //'https://s3-drive.vpjoshi.in'; http://localhost:8080

export const useDrive = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("");

    // --- AUTH FETCH HELPER ---
    const authFetch = useCallback(async (endpoint, options = {}) => {
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
    }, [navigate]);

    // --- API ACTIONS ---

    // 1. Listings
    const listFiles = async (folderId) => {
        const query = folderId ? `?parentId=${folderId}` : '';
        const res = await authFetch(`/api/files${query}`);
        return await res.json();
    };

    // --- MISSING FUNCTION ADDED HERE ---
    const listRecents = async () => {
        const res = await authFetch(`/api/recents`);
        return await res.json();
    };
    // ----------------------------------

    const listStarred = async () => {
        const res = await authFetch(`/api/starred`);
        return await res.json();
    };

    const listTrash = async () => {
        const res = await authFetch(`/api/trash`);
        return await res.json();
    };

    // 2. Mutations
    const createFolder = async (name, parentId) => {
        await authFetch('/api/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, parentId })
        });
    };
    
    const softDelete = async (id) => {
        await authFetch('/api/soft-delete', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) 
        });
    };

    const hardDelete = async (id) => {
        await authFetch(`/api/delete?id=${id}`, { method: 'DELETE' });
    };

    const restoreItem = async (id) => {
        await authFetch('/api/restore', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) 
        });
    };

    const toggleStar = async (id) => {
        await authFetch('/api/star-toggle', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) 
        });
    };

    const downloadFile = async (id) => {
        const res = await authFetch(`/api/download?id=${id}`);
        const data = await res.json();
        window.open(data.downloadUrl, '_blank');
    };

    const searchFiles = async (query) => {
        const res = await authFetch(`/api/search?q=${encodeURIComponent(query)}`);
        return await res.json();
    };

    // 3. Upload Logic
    const uploadSingleFile = async (file, parentId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Init
                const initRes = await authFetch('/api/upload-init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, size: file.size, parentId })
                });
                const initData = await initRes.json();

                // Upload
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', initData.uploadUrl, true);
                xhr.upload.onprogress = (ev) => {
                    if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                };
                xhr.onload = async () => {
                    if (xhr.status === 200) {
                         try {
                            await authFetch('/api/upload-finalize', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fileId: initData.fileId })
                            });
                            resolve();
                         } catch (err) { reject(err); }
                    } else { reject(new Error("Upload failed")); }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send(file);
            } catch (err) { reject(err); }
        });
    };

    const processBatchUpload = async (files, parentId, onSuccess) => {
        if (files.length === 0) return;
        setIsUploading(true);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(0);
            setUploadStatus(`Uploading (${i + 1}/${files.length}): ${file.name}`);
            try {
                await uploadSingleFile(file, parentId);
            } catch (error) {
                alert(`Error uploading ${file.name}: ${error.message}`);
            }
        }

        setUploadStatus("Done!");
        setTimeout(() => {
            setIsUploading(false);
            if(onSuccess) onSuccess();
        }, 1000);
    };

    return {
        loading, setLoading,
        isUploading, uploadProgress, uploadStatus,
        listFiles, listStarred, listTrash, listRecents, searchFiles, // Added listRecents here
        createFolder, softDelete, hardDelete, restoreItem, toggleStar, downloadFile,
        processBatchUpload
    };
};