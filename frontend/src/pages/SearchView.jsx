import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import { FolderItem, FileItem } from '../components/DriveItems';
import { Spinner, Section, EmptyState } from '../components/ViewPrimitives';

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
    const files   = items.filter(i => !i.is_folder);

    return (
        <div className="h-full overflow-y-auto" style={{ padding: '20px 16px 100px', overflowX: 'hidden', backgroundColor: 'var(--bg-base)' }}>
            <style>{`@media(min-width:768px){.view-inner{padding-left:32px;padding-right:32px;}}`}</style>
            <div className="view-inner">

                {/* Search bar */}
                <div style={{ maxWidth: '600px', margin: '0 auto 28px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0 8px 0 14px', borderRadius: '14px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgb(59 130 246 / 0.12)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') runSearch(searchTerm); }}
                            placeholder="Search files and folders…"
                            autoFocus
                            style={{
                                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                                fontSize: '14px', color: 'var(--text-primary)', padding: '13px 0',
                                fontFamily: 'inherit',
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(''); setItems([]); setHasSearched(false); inputRef.current?.focus(); }}
                                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--text-muted)', flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={() => runSearch(searchTerm)}
                            disabled={!searchTerm.trim() || loading}
                            className="btn-primary"
                            style={{ fontSize: '13px', padding: '7px 16px', borderRadius: '8px', flexShrink: 0 }}
                        >
                            Search
                        </button>
                    </div>
                    {hasSearched && !loading && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', paddingLeft: '2px' }}>
                            {items.length === 0
                                ? `No results for "${searchTerm}"`
                                : `${items.length} result${items.length !== 1 ? 's' : ''} for "${searchTerm}"`}
                        </p>
                    )}
                </div>

                {loading ? <Spinner /> : (
                    <>
                        {!hasSearched && (
                            <EmptyState
                                icon={
                                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                }
                                title="Search your drive"
                                subtitle="Type a name and press Enter"
                            />
                        )}
                        {hasSearched && items.length === 0 && (
                            <EmptyState
                                icon={
                                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                }
                                title="No results found"
                                subtitle={`Nothing matched "${searchTerm}" — try a different term`}
                            />
                        )}
                        {folders.length > 0 && (
                            <Section title="Folders" count={folders.length}>
                                {folders.map(f => <FolderItem key={f.id} folder={f} onClick={handleFolderClick} onAction={handleItemAction} />)}
                            </Section>
                        )}
                        {files.length > 0 && (
                            <Section title="Files" count={files.length}>
                                {files.map(f => <FileItem key={f.id} file={f} onDownload={downloadFile} onAction={handleItemAction} />)}
                            </Section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchView;