

import React from 'react';
import type { GeneratedProfile } from '../types';
import Logo from './Logo';
import { placeholderImage } from '../assets/placeholder';

interface ProfilePageProps {
  student: GeneratedProfile;
  onRetry?: (studentId: number) => void;
}

/**
 * Formats a string value into Indian Rupee (INR) currency format.
 * Handles numbers, "Free", "0", and other text like "Sponsored".
 * @param fees The fee string to format.
 * @returns A formatted currency string (e.g., "₹5,000", "Free").
 */
const formatToINR = (fees: string): string => {
  if (!fees) return 'N/A';
  const lowerCaseFees = fees.trim().toLowerCase();

  if (lowerCaseFees === 'free' || lowerCaseFees === '0') {
    return 'Free';
  }

  const numericValue = parseFloat(fees.replace(/[^0-9.]/g, ''));

  if (isNaN(numericValue)) {
    return fees;
  }
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(numericValue);
};


const ProfilePage: React.FC<ProfilePageProps> = ({ student, onRetry }) => {
  const pageContainerStyle: React.CSSProperties = { 
      width: '210mm', 
      height: '297mm', 
      display: 'flex', 
      flexDirection: 'column' 
  };
  
  if (student.isRetrying) {
    return (
      <div className="bg-white" style={pageContainerStyle}>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">Retrying for {student.name}...</p>
        </div>
      </div>
    );
  }

  if (student.error) {
    return (
      <div className="bg-white" style={pageContainerStyle}>
          <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-red-50">
            <div className="flex items-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-2xl font-bold">Generation Failed</h3>
            </div>
            <p className="mt-3 text-sm text-red-700 max-w-md">{student.error.message}</p>
            {student.error.retryable && onRetry && (
                <button 
                    onClick={() => onRetry(student.id)} 
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 17H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Retry
                </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white" style={pageContainerStyle}>
      <header className="px-16 pt-12 pb-8 flex justify-between items-start bg-blue-50 border-b-4 border-blue-500">
        <div>
            <h2 className="text-5xl font-bold text-gray-800">{student.name}</h2>
            <p className="text-xl text-gray-600 mt-2">{student.age} years old • {student.center}</p>
        </div>
        <Logo className="h-16 w-auto" />
      </header>
      
      <main className="flex-grow flex p-16">
        <div className="flex space-x-12">
          <div className="w-1/3 flex-shrink-0 flex flex-col space-y-6">
            <img src={student.photo || placeholderImage} alt={student.name} className="w-full rounded-lg shadow-xl object-cover bg-gray-100" style={{ aspectRatio: '1 / 1' }} />
             <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">Training Details</h3>
              <ul className="grid grid-cols-1 gap-y-3 text-gray-700 text-base">
                  <li className="flex items-start"><strong className="w-24 font-medium flex-shrink-0">Trade:</strong><span className="break-words min-w-0">{student.trade}</span></li>
                  <li className="flex items-start"><strong className="w-24 font-medium flex-shrink-0">Education:</strong><span className="break-words min-w-0">{student.education}</span></li>
                  <li className="flex items-start"><strong className="w-24 font-medium flex-shrink-0">Duration:</strong><span className="break-words min-w-0">{student.trainingduration}</span></li>
                  <li className="flex items-start"><strong className="w-24 font-medium flex-shrink-0">Fees:</strong><span className="break-words min-w-0">{formatToINR(student.trainingfees)}</span></li>
              </ul>
            </div>
          </div>
          <div className="w-2/3">
              <h3 className="text-2xl font-semibold text-blue-700 border-b-2 border-blue-200 pb-2">Profile Narrative</h3>
              <p className="text-lg text-gray-800 mt-4 leading-relaxed whitespace-pre-wrap font-serif">
                  {student.profileText}
              </p>
          </div>
        </div>
      </main>

      <footer className="px-16 py-6 text-center text-sm text-gray-500 bg-gray-50 border-t">
        Generated by Sarjan Foundation Student Profiler • Empowering Futures
      </footer>
    </div>
  );
};

export default ProfilePage;
