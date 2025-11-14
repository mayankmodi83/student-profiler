import type { Student } from '../types';

/**
 * Parses a line of CSV text using a regular expression to handle quoted fields.
 * This is more robust than manual character-by-character parsing.
 */
const parseCsvLine = (line: string): string[] => {
    // Regex to split on commas that are not inside double quotes.
    const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
    const fields = line.split(regex);
    
    // Clean up each field
    return fields.map(field => {
        if (field === undefined) {
          return '';
        }
        // Trim whitespace from the start and end
        let value = field.trim();
        
        // If the field is quoted (starts and ends with a quote), remove them.
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
        }
        
        // In CSV, a quote inside a quoted string is escaped by another quote ("").
        // Replace these escaped double quotes with a single double quote.
        return value.replace(/""/g, '"');
    });
};


/**
 * Parses a date string in DD-MMM-YY format (e.g., "15-Jan-02") into a Date object.
 * Also handles standard formats like YYYY-MM-DD.
 * @param dateStr The date string to parse.
 * @returns A Date object or null if parsing fails.
 */
const parseBirthdate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // Try parsing DD-MMM-YY format first
    const parts = dateStr.match(/^(\d{1,2})-([a-zA-Z]{3})-(\d{2})$/);
    if (parts) {
        const day = parseInt(parts[1], 10);
        const monthStr = parts[2].toLowerCase();
        const year = parseInt(parts[3], 10);

        const monthMap: { [key: string]: number } = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };

        const month = monthMap[monthStr];
        if (month === undefined) return null;

        // Convert 2-digit year to 4-digit year.
        // If the 2-digit year is greater than the current 2-digit year, it's from the previous century.
        const currentYearLastTwoDigits = new Date().getFullYear() % 100;
        const fullYear = year > currentYearLastTwoDigits ? 1900 + year : 2000 + year;

        const birthDate = new Date(fullYear, month, day);

        // Final check for validity, e.g., for "31-Feb-02"
        if (birthDate.getFullYear() !== fullYear || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
            return null;
        }
        return birthDate;
    }

    // Fallback for YYYY-MM-DD or other standard formats that new Date() can parse
    const fallbackDate = new Date(dateStr);
    
    // Check if the fallback is a valid date
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};


/**
 * Calculates age from a birthdate string. Supports "DD-MMM-YY" and "YYYY-MM-DD".
 */
const calculateAge = (birthdate: string): number => {
    if (!birthdate) return 0;
    const birthDate = parseBirthdate(birthdate);
    if (!birthDate || isNaN(birthDate.getTime())) return 0; // Invalid date format

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const fetchStudentsFromSheet = async (url: string): Promise<Student[]> => {
  // Regex to extract the sheet ID from various Google Sheets URL formats
  const sheetIdRegex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(sheetIdRegex);

  if (!match || !match[1]) {
    throw new Error("Invalid Google Sheet URL. Could not find a Sheet ID.");
  }
  const sheetId = match[1];
  
  // We default to the first sheet (gid=0).
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

  try {
    const response = await fetch(exportUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet. Status: ${response.status}`);
    }
    const csvText = await response.text();
    const lines = csvText.trim().split(/\r?\n/);
    
    if (lines.length < 2) {
      throw new Error("The sheet is empty or has only a header row.");
    }

    const headerLine = lines.shift();
    if (!headerLine) throw new Error("CSV file is missing a header row.");
    const headers = parseCsvLine(headerLine.toLowerCase());
    
    const requiredHeaders = ['id', 'name', 'address', 'birthdate', 'familybackground', 'photo', 'trade', 'center', 'socioeconomicstatus', 'education', 'trainingduration', 'trainingfees'];
    
    // Check headers by cleaning them first
    const cleanHeaders = headers.map(h => h.replace(/^"|"$/g, '').replace(/\s/g, ''));
    for(const required of requiredHeaders){
        if(!cleanHeaders.includes(required)){
             throw new Error(`Missing required column in sheet: "${required}"`);
        }
    }
    
    const students: Student[] = lines.map((line) => {
      if (!line.trim()) return null; // Skip empty lines

      const values = parseCsvLine(line);
      const studentData: any = {};
      
      headers.forEach((header, i) => {
        // Clean the header: remove surrounding quotes, then all internal spaces.
        const cleanHeader = header.replace(/^"|"$/g, '').replace(/\s/g, '');
        // Clean the value: remove surrounding quotes. .trim() is already done by parseCsvLine.
        const cleanValue = (values[i] || '').replace(/^"|"$/g, '');
        studentData[cleanHeader] = cleanValue;
      });
      
      const birthdate = studentData.birthdate;

      return {
        id: parseInt(studentData.id, 10),
        name: studentData.name,
        address: studentData.address,
        birthdate: birthdate,
        age: calculateAge(birthdate),
        familybackground: studentData.familybackground,
        photo: studentData.photo,
        trade: studentData.trade,
        center: studentData.center,
        socioeconomicstatus: studentData.socioeconomicstatus,
        education: studentData.education,
        trainingduration: studentData.trainingduration,
        trainingfees: studentData.trainingfees,
      };
    }).filter((s): s is Student => s !== null && !isNaN(s.id));

    return students;

  } catch (error) {
    console.error("Error fetching or parsing sheet:", error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error("Could not fetch the sheet. Please ensure the URL is correct and the sheet is publicly accessible ('Anyone with the link').");
    }
    throw error;
  }
};