

import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import PreviewActions from './components/PreviewActions';

// Helper function to create a safe filename from a string
const sanitizeFilename = (name: string): string => {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with a single hyphen
        .replace(/[^\w-]/g, ''); // Remove characters that are not word chars (alphanumeric, underscore) or hyphen
};

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedProfiles, setGeneratedProfiles] = useState<GeneratedProfile[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [sheetImportState, setSheetImportState] = useState<{loading: boolean, error: string | null}>({ loading: false, error: null});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [tradeFilter, setTradeFilter] = useState<string>('');
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const filteredStudents = useMemo(() => {
    if (!tradeFilter) {
      return students;
    }
    return students.filter(student =>
      student.trade.toLowerCase().includes(tradeFilter.toLowerCase())
    );
  }, [students, tradeFilter]);

  const visibleSelectedCount = useMemo(() => {
    const filteredIds = new Set(filteredStudents.map(s => s.id));
    let count = 0;
    for (const id of selectedStudentIds) {
        if (filteredIds.has(id)) {
            count++;
        }
    }
    return count;
}, [filteredStudents, selectedStudentIds]);

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
    setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
  }, [filteredStudents]);

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
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfContainerRef.current) return;

    setIsDownloadingPdf(true);
    
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    const container = pdfContainerRef.current!;

    for (let i = 0; i < container.children.length; i++) {
      const pageWrapper = container.children[i] as HTMLElement;
      const pageElement = pageWrapper.firstChild as HTMLElement; // The actual ProfilePage
      
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
    
    // Determine filename based on number of profiles
    let filename = 'profiles.pdf';
    if (generatedProfiles.length === 1) {
        const student = generatedProfiles[0];
        const saneName = sanitizeFilename(student.name);
        const saneCenter = sanitizeFilename(student.center);
        filename = `${saneName}-${saneCenter}.pdf`;
    }
    
    pdf.save(filename);
    setIsDownloadingPdf(false);
  };

  const handleGoBack = () => {
    setGeneratedProfiles([]);
    handleDeselectAll();
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {isGenerating && <LoadingOverlay />}
      {isImportModalOpen && (
          <ImportSheetModal 
              onClose={() => setIsImportModalOpen(false)}
              onImport={handleImportSheet}
              loading={sheetImportState.loading}
              error={sheetImportState.error}
          />
      )}
      
      {generatedProfiles.length > 0 ? (
        <>
          <PreviewActions 
            profileCount={generatedProfiles.length}
            onDownloadPdf={handleDownloadPdf}
            onGoBack={handleGoBack}
            isDownloading={isDownloadingPdf}
          />
          <main className="flex-grow bg-gray-50 py-8 overflow-y-auto">
            <div ref={pdfContainerRef} className="mx-auto flex flex-col items-center gap-8">
              {generatedProfiles.map(profile => (
                <div key={profile.id} className="shadow-2xl">
                  <ProfilePage student={profile} />
                </div>
              ))}
            </div>
          </main>
        </>
      ) : (
        <>
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-24">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Select Students</h2>
                        <p className="text-md text-gray-600 mt-1">Choose students to generate an AI-powered profile, or import a new list.</p>
                    </div>
                     <div className="flex items-center gap-x-4">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="trade-filter"
                                id="trade-filter"
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="Filter by trade..."
                                value={tradeFilter}
                                onChange={(e) => setTradeFilter(e.target.value)}
                                aria-label="Filter students by trade"
                            />
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
                </div>

                {students.length > 0 ? (
                    <StudentList
                    students={filteredStudents}
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
                    totalSelectedCount={selectedStudentIds.size}
                    visibleSelectedCount={visibleSelectedCount}
                    totalVisibleCount={filteredStudents.length}
                    onGenerate={handleGenerateProfiles}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    isGenerating={isGenerating}
                />
            )}
        </>
      )}
    </div>
  );
};

export default App;