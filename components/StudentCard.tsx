

import React from 'react';
import type { Student } from '../types';
import { placeholderImage } from '../assets/placeholder';

interface StudentCardProps {
  student: Student;
  isSelected: boolean;
  onToggleSelect: (studentId: number) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, isSelected, onToggleSelect }) => {
  return (
    <div 
        className={`relative rounded-lg overflow-hidden border transition-all duration-300 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500 shadow-lg' : 'border-gray-200 bg-white shadow-sm hover:shadow-md'}`}
    >
      <div className="absolute top-3 right-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(student.id)}
          className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
      
      <div className="flex flex-col h-full">
        <img 
          src={student.photo || placeholderImage} 
          alt={student.name} 
          className="w-full h-48 object-cover bg-gray-100" 
        />
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
          <p className="text-sm text-gray-500">{student.age} years old</p>
          <p className="text-sm text-gray-600 mt-1">{student.center}</p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex-grow">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trade</h4>
            <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {student.trade}
                </span>
            </div>
             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3">Education</h4>
             <p className="text-sm text-gray-700 mt-1">{student.education}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;