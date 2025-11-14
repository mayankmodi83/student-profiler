
import React from 'react';
import Logo from './Logo';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-100 border-b border-gray-200 sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight hidden sm:block">
              Student Profiler
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;