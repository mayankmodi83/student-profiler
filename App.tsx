
import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Student, GeneratedProfile } from './types';
import { fetchStudentsFromSheet } from './services/googleSheetService';
import { generateStudentProfileText } from './services/geminiService';
import Header from './components/Header';
import StudentList from './components/StudentList';
import ActionFooter from './components/ActionFooter';
import LoadingOverlay from './components/LoadingOverlay';
import ProfilePage from './components/ProfilePage';
import ImportSheetModal from './components/ImportSheetModal';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedProfiles, setGeneratedProfiles] = useState<GeneratedProfile[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [sheetImportState, setSheetImportState] = useState<{loading: boolean, error: string | null}>({ loading: false, error: null});
  const pdfContainerRef = useRef<HTMLDivElement>(null);


  const handleToggleSelect = useCallback((studentId: number) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedStudentIds(new Set(students.map(s => s.id)));
  }, [students]);

  const handleDeselectAll = useCallback(() => {
    setSelectedStudentIds(new Set());
  }, []);

  const handleGenerateProfiles = async () => {
    if (selectedStudentIds.size === 0) return;
    
    setIsGenerating(true);
    setGeneratedProfiles([]);

    const selectedStudents = students.filter(s => selectedStudentIds.has(s.id));
    
    try {
      const profilePromises = selectedStudents.map(async student => {
        const profileText = await generateStudentProfileText(student);
        return { ...student, profileText };
      });

      const profiles = await Promise.all(profilePromises);
      setGeneratedProfiles(profiles);
    } catch (error) {
      console.error("Failed to generate profiles:", error);
      alert("An error occurred while generating profiles. Please check the console for details.");
      setIsGenerating(false);
    }
  };

  const handleImportSheet = async (url: string) => {
    if (!url) {
      setSheetImportState({ loading: false, error: "Please enter a URL." });
      return;
    }
    setSheetImportState({ loading: true, error: null });
    try {
      const newStudents = await fetchStudentsFromSheet(url);
      setStudents(newStudents);
      handleDeselectAll();
      setIsImportModalOpen(false);
    } catch (error) {
       setSheetImportState({ loading: false, error: error instanceof Error ? error.message : "An unknown error occurred." });
    }
  };
  
  const openImportModal = () => {
    setSheetImportState({ loading: false, error: null });
    setIsImportModalOpen(true);
  }

  useEffect(() => {
    if (generatedProfiles.length > 0 && pdfContainerRef.current) {
      const generatePdf = async () => {
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        const container = pdfContainerRef.current!;

        for (let i = 0; i < container.children.length; i++) {
          const pageElement = container.children[i] as HTMLElement;
          const canvas = await html2canvas(pageElement, {
            scale: 3, // Higher scale for better quality
            useCORS: true, 
            logging: false,
          });
          const imgData = canvas.toDataURL('image/png');

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        
        pdf.save('sarjan_foundation_student_profiles.pdf');
        setIsGenerating(false);
        setGeneratedProfiles([]); // Clean up
        handleDeselectAll();
      };
      
      // Timeout to ensure elements are rendered before capturing
      const timer = setTimeout(generatePdf, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedProfiles]);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isGenerating && <LoadingOverlay />}
      {isImportModalOpen && (
          <ImportSheetModal 
              onClose={() => setIsImportModalOpen(false)}
              onImport={handleImportSheet}
              loading={sheetImportState.loading}
              error={sheetImportState.error}
          />
      )}
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Select Students</h2>
                <p className="text-md text-gray-600 mt-1">Choose students to generate an AI-powered profile, or import a new list.</p>
            </div>
            <button
                onClick={openImportModal}
                className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>Import from Google Sheet</span>
            </button>
        </div>

        {students.length > 0 ? (
            <StudentList
              students={students}
              selectedStudentIds={selectedStudentIds}
              onToggleSelect={handleToggleSelect}
            />
        ) : (
             <div className="text-center py-20 px-6 border-2 border-dashed border-gray-300 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No students loaded</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by importing a student list from a public Google Sheet.</p>
                <div className="mt-6">
                    <button
                        onClick={openImportModal}
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Import Sheet
                    </button>
                </div>
            </div>
        )}
      </main>
      
      {students.length > 0 && (
          <ActionFooter
            selectedCount={selectedStudentIds.size}
            totalCount={students.length}
            onGenerate={handleGenerateProfiles}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            isGenerating={isGenerating}
          />
      )}
      
      {/* Off-screen container for rendering PDF pages */}
      <div ref={pdfContainerRef} className="absolute -left-[9999px] top-0">
          {generatedProfiles.map(profile => (
              <ProfilePage key={profile.id} student={profile} />
          ))}
      </div>
    </div>
  );
};

export default App;