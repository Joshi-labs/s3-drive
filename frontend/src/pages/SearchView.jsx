import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';

const SearchIcon = ({ size = 5 }) => (
    <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
);

const Section = ({ title, count, children }) => (
    <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-3 px-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</p>
            <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            >{count}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">{children}</div>
    </div>
);

const SearchView = () => {
    const navigate = useNavigate();
    const { loading, searchFiles, softDelete, toggleStar, downloadFile } = useDrive();
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef(null);

    const runSearch = async (term) => {
        if (!term.trim()) return;
        try {
            const data = await searchFiles(term);
            setItems(data);
            setHasSearched(true);
        } catch (e) { console.error(e); }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') runSearch(searchTerm); };

    const handleItemAction = async (action, item) => {
        if (action === 'delete') {
            await softDelete(item.id);
            setItems(prev => prev.filter(i => i.id !== item.id));
        } else if (action === 'star') {
            await toggleStar(item.id);
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_starred: !i.is_starred } : i));
        } else if (action === 'copy') {
            navigator.clipboard.writeText(`${window.location.origin}/drive/${item.id}`);
        }
    };

    const handleFolderClick = (id, name) => navigate(`/drive/${id}`, {
        state: { folderName: name, source: { label: 'Search', path: '/drive/search' } }
    });

    const folders = items.filter(i => i.is_folder);
    const files = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto p-5 md:p-8 pb-24" style={{ backgroundColor: 'var(--bg-base)' }}>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <div
                    className="flex items-center gap-3 px-4 rounded-2xl transition-all"
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                    onFocus={() => {}}
                >
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        <SearchIcon size={4} />
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search files and folders…"
                        autoFocus
                        className="flex-1 py-3.5 text-sm bg-transparent border-none outline-none"
                        style={{ color: 'var(--text-primary)' }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => { setSearchTerm(''); setItems([]); setHasSearched(false); inputRef.current?.focus(); }}
                            className="p-1 rounded-lg transition-colors flex-shrink-0"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => runSearch(searchTerm)}
                        disabled={!searchTerm.trim() || loading}
                        className="btn-primary px-4 py-1.5 text-xs flex-shrink-0"
                        style={{ borderRadius: '10px' }}
                    >
                        Search
                    </button>
                </div>
                {hasSearched && !loading && (
                    <p className="text-xs mt-2 px-1" style={{ color: 'var(--text-muted)' }}>
                        {items.length === 0
                            ? `No results for "${searchTerm}"`
                            : `${items.length} result${items.length !== 1 ? 's' : ''} for "${searchTerm}"`
                        }
                    </p>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-7 h-7 rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--blue)', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : (
                <>
                    {/* Pre-search state */}
                    {!hasSearched && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            >
                                <SearchIcon size={7} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Search your drive</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Type a name above and press Enter or click Search</p>
                        </div>
                    )}

                    {/* No results */}
                    {hasSearched && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            >
                                <SearchIcon size={7} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No results found</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try a different search term</p>
                        </div>
                    )}

                    {/* Results */}
                    {folders.length > 0 && (
                        <Section title="Folders" count={folders.length}>
                            {folders.map(f => (
                                <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />
                            ))}
                        </Section>
                    )}
                    {files.length > 0 && (
                        <Section title="Files" count={files.length}>
                            {files.map(f => (
                                <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />
                            ))}
                        </Section>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchView;