import React, { useState } from 'react';
import Icons from './icons';

// 1. Accept the props from Dashboard
const FloatingAddButton = ({ onNewFolder, onUploadClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {isOpen && (
        <>
          {/* 2. Wire up New Folder Click */}
          <button 
            onClick={() => { setIsOpen(false); onNewFolder(); }}
            className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition animate-fade-in-up"
          >
            <Icons.Folder className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-medium text-sm">New Folder</span>
          </button>

          {/* 3. Wire up File Upload Click */}
          <button 
            onClick={() => { setIsOpen(false); onUploadClick(); }}
            className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition animate-fade-in-up delay-75"
          >
            <Icons.File className="w-5 h-5 mr-2 text-blue-500" />
            <span className="font-medium text-sm">File Upload</span>
          </button>
        </>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-white text-gray-600 rotate-45' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'
        }`}
      >
        <Icons.Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default FloatingAddButton;