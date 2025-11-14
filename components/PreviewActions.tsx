
import React from 'react';

interface PreviewActionsProps {
  profileCount: number;
  onDownloadPdf: () => void;
  onGoBack: () => void;
  isDownloading: boolean;
}

const PreviewActions: React.FC<PreviewActionsProps> = ({ profileCount, onDownloadPdf, onGoBack, isDownloading }) => {
  return (
    <header className="bg-gray-100 border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onGoBack}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Back to Selection</span>
            </button>
            <p className="text-sm text-gray-600 font-medium">
              Generated <span className="font-bold text-blue-600">{profileCount}</span> Profile{profileCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PreviewActions;
