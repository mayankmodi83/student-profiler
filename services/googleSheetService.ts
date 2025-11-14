import type { Student } from '../types';

/**
 * Parses a line of CSV text using a state machine to handle quoted fields,
 * commas within quotes, and escaped quotes (""). This is more robust than a regex split.
 */
const parseCsvLine = (line: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"') {
                // Check if this quote is escaped by another quote
                if (i + 1 < line.length && line[i + 1] === '"') {
                    // It's an escaped quote, add a single quote to the field
                    currentField += '"';
                    i++; // and skip the next character
                } else {
                    // It's the closing quote for the field
                    inQuotes = false;
                }
            } else {
                // It's a regular character inside quotes
                currentField += char;
            }
        } else { // Not in quotes
            if (char === '"') {
                // The start of a quoted field.
                inQuotes = true;
            } else if (char === ',') {
                // A field separator
                fields.push(currentField);
                currentField = '';
            } else {
                // A regular character
                currentField += char;
            }
        }
    }

    // Add the last field to the array
    fields.push(currentField);
    
    // Trim whitespace from each field, which handles cases like ` 1, "name" `
    return fields.map(field => field.trim());
};

/**
 * Splits a CSV string into an array of row strings, correctly handling
 * newlines that appear inside quoted fields.
 * @param csvText The full CSV content as a single string.
 * @returns An array of strings, where each string is a complete row.
 */
const splitCsvIntoRows = (csvText: string): string[] => {
    const rows: string[] = [];
    let currentRowStart = 0;
    let inQuotes = false;
    // Normalize line endings and trim whitespace from the start/end of the whole text
    const normalizedText = csvText.replace(/\r\n/g, '\n').trim();

    for (let i = 0; i < normalizedText.length; i++) {
        const char = normalizedText[i];

        if (char === '"') {
            // Check for an escaped quote (""). If found, skip the second quote.
            if (inQuotes && i + 1 < normalizedText.length && normalizedText[i + 1] === '"') {
                i++;
            } else {
                // Otherwise, it's a regular quote, so toggle the inQuotes flag.
                inQuotes = !inQuotes;
            }
        }

        // A newline character marks the end of a row, but only if we're not inside quotes.
        if (char === '\n' && !inQuotes) {
            const row = normalizedText.substring(currentRowStart, i);
            rows.push(row);
            currentRowStart = i + 1; // The next row starts after the newline character.
        }
    }

    // After the loop, add the final row if it exists.
    if (currentRowStart < normalizedText.length) {
        rows.push(normalizedText.substring(currentRowStart));
    }

    // Filter out any resulting empty rows, which can happen with trailing newlines.
    return rows.filter(row => row.trim() !== '');
};


/**
 * Parses a date string in DD-Month-YY format (e.g., "15-Jan-02") into a Date object.
 * Also handles standard formats like YYYY-MM-DD.
 * @param dateStr The date string to parse.
 * @returns A Date object or null if parsing fails.
 */
const parseBirthdate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // Try parsing DD-Month-YY format, allowing for long month names
    const parts = dateStr.match(/^(\d{1,2})-([a-zA-Z]+)-(\d{2})$/);
    if (parts) {
        const day = parseInt(parts[1], 10);
        const monthStr = parts[2].toLowerCase().substring(0, 3); // "june" -> "jun"
        const year = parseInt(parts[3], 10);

        const monthMap: { [key: string]: number } = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };

        const month = monthMap[monthStr];
        if (month === undefined) return null;

        // Convert 2-digit year to 4-digit year.
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
 * Calculates age from a birthdate string.
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

/**
 * Transforms a Google Drive file viewer URL into a direct image access URL.
 * @param url The original Google Drive URL.
 * @returns A direct image URL or the original URL if it's not a recognized format.
 */
const transformGoogleDriveImageUrl = (url: string): string => {
    if (!url) return '';
    
    // This regex captures the file ID from URLs like:
    // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // - https://drive.google.com/open?id=FILE_ID
    const fileIdRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/;
    const match = url.match(fileIdRegex);

    if (match && match[1]) {
        const fileId = match[1];
        // Use the Google User Content endpoint for direct image access
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Return original URL if it doesn't match, allowing for other image hosts.
    return url;
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
    // Use the robust row splitter that handles newlines within fields
    const lines = splitCsvIntoRows(csvText);
    
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
        // Values from parseCsvLine are already clean (trimmed and unquoted)
        studentData[cleanHeader] = values[i] || '';
      })
      
      const birthdate = studentData.birthdate;
      const photoUrl = studentData.photo;
      return {
        id: parseInt(studentData.id, 10),
        name: studentData.name,
        address: studentData.address,
        birthdate: birthdate,
        age: calculateAge(birthdate),
        familybackground: studentData.familybackground,
        photo: transformGoogleDriveImageUrl(photoUrl),
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