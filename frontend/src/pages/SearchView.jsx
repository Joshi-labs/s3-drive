import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import Icons from '../components/icons';

const SearchView = () => {
    const navigate = useNavigate();
    const { loading, searchFiles, softDelete, toggleStar, downloadFile } = useDrive();
    
    // Local State for Search
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState([]);
    const [hasSearched, setHasSearched] = useState(false); // To distinguish "fresh load" vs "no results"

    const handleSearch = async (e) => {
        // Search on Enter key or if triggered manually
        if ((e.key === 'Enter' || e.type === 'click') && searchTerm.trim()) {
            try {
                const data = await searchFiles(searchTerm);
                setItems(data);
                setHasSearched(true);
            } catch(error) {
                console.error(error);
            }
        }
    };

    // Actions (Instant Soft Delete)
    const handleItemAction = async (action, item) => {
        if (action === 'delete') {
            await softDelete(item.id);
            // Remove item locally to avoid re-fetching
            setItems(prev => prev.filter(i => i.id !== item.id));
        } 
        else if (action === 'star') {
            await toggleStar(item.id);
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
                // We point back to search, but note: results will reset on back button
                source: { label: 'Search', path: '/drive/search' } 
            } 
        });
    };

    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto p-4 pb-24 md:p-8 relative scroll-smooth">
            
            {/* --- NEW LOCAL SEARCH BAR --- */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icons.Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Search for files, folders..." 
                        className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-none text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg rounded-2xl transition-all" 
                        autoFocus
                    />
                    <button 
                        onClick={handleSearch}
                        className="absolute inset-y-2 right-2 px-4 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Empty State (Before Search) */}
                    {!hasSearched && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
                            <Icons.Search className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg">Type above to find your files</p>
                        </div>
                    )}

                    {/* No Results State */}
                    {hasSearched && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p>No results found for "{searchTerm}"</p>
                        </div>
                    )}

                    {/* Results Grid */}
                    {folders.length > 0 && (
                        <div className="mb-8 animate-fade-in">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Folders</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                {folders.map(f => (
                                    <FolderItem 
                                        key={f.id} 
                                        folder={f} 
                                        onClick={handleFolderClick} 
                                        onAction={handleItemAction} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {files.length > 0 && (
                        <div className="animate-fade-in">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Files</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                {files.map(f => (
                                    <FileItem 
                                        key={f.id} 
                                        file={f} 
                                        onDownload={downloadFile} 
                                        onAction={handleItemAction} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchView;