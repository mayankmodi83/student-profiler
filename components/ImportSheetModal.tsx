
import React, { useState } from 'react';

interface ImportSheetModalProps {
  onClose: () => void;
  onImport: (url: string) => void;
  loading: boolean;
  error: string | null;
}

const ImportSheetModal: React.FC<ImportSheetModalProps> = ({ onClose, onImport, loading, error }) => {
  const [url, setUrl] = useState('');

  const handleImportClick = () => {
    onImport(url);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleImportClick();
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              Import from Google Sheet
            </h3>
            <button
              type="button"
              className="p-1 -mt-1 -mr-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Paste the URL of a public Google Sheet. Ensure it's shared with "Anyone with the link".
          </p>
          <div className="mt-4">
            <label htmlFor="sheet-url" className="block text-sm font-medium text-gray-700">
              Google Sheet URL
            </label>
            <input
              type="url"
              id="sheet-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </div>
          {error && (
            <div className="mt-3 bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
           <p className="text-xs text-gray-500 mt-2">
            Required columns: id, name, address, birthdate, familybackground, photo, trade, center, socioeconomicstatus, education, trainingduration, trainingfees.
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleImportClick}
            disabled={loading}
          >
            {loading ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                </>
            ) : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportSheetModal;