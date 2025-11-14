
import React from 'react';

interface ActionFooterProps {
  totalSelectedCount: number;
  visibleSelectedCount: number;
  totalVisibleCount: number;
  onGenerate: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isGenerating: boolean;
}

const ActionFooter: React.FC<ActionFooterProps> = ({ 
  totalSelectedCount,
  visibleSelectedCount,
  totalVisibleCount,
  onGenerate, 
  onSelectAll, 
  onDeselectAll, 
  isGenerating 
}) => {
  const allVisibleSelected = visibleSelectedCount === totalVisibleCount && totalVisibleCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="select-all"
                type="checkbox"
                checked={allVisibleSelected}
                onChange={allVisibleSelected ? onDeselectAll : onSelectAll}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label={allVisibleSelected ? 'Deselect all visible students' : 'Select all visible students'}
              />
              <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-700">
                {allVisibleSelected ? 'Deselect All' : 'Select All'}
              </label>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-blue-600">{visibleSelectedCount}</span> of {totalVisibleCount} selected
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={totalSelectedCount === 0 || isGenerating}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </div>
            ) : `Generate ${totalSelectedCount > 0 ? totalSelectedCount : ''} Profile${totalSelectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionFooter;
