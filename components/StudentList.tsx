
import React from 'react';
import type { Student } from '../types';
import StudentCard from './StudentCard';

interface StudentListProps {
  students: Student[];
  selectedStudentIds: Set<number>;
  onToggleSelect: (studentId: number) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, selectedStudentIds, onToggleSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          isSelected={selectedStudentIds.has(student.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};

export default StudentList;
