

import { GoogleGenAI } from "@google/genai";
import type { Student } from "../types";

// Fix: Per coding guidelines, assume API_KEY is available via process.env
// and use it directly to initialize the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudentProfileText = async (student: Student): Promise<string> => {
  const prompt = `
    Generate a warm, inspiring, and positive one-paragraph profile for a student for "Sarjan Foundation", an NGO that supports underprivileged youth with vocational training. The tone should be hopeful, highlighting the student's resilience and potential.

    Weave the following details into a short, compelling narrative. Focus on their strengths and aspirations. Do not just list the facts. Be sure to sensitively incorporate their socio-economic status as part of the context of the challenges they are overcoming.

    Student Details:
    - Name: ${student.name}
    - Age: ${student.age}
    - Center: ${student.center}
    - Address: ${student.address}
    - Education Level: ${student.education}
    - Family Background: ${student.familybackground}
    - Socio-Economic Status: ${student.socioeconomicstatus}
    
    Training Information:
    - Trade / Skill: ${student.trade}
    - Training Duration: ${student.trainingduration}
    - Training Fees: ${student.trainingfees}

    Example tone: "Meet ${student.name}, a determined ${student.age}-year-old from ${student.center}. Coming from a challenging socio-economic background, ${student.name} has shown great promise in their studies in ${student.trade}. With the support of Sarjan Foundation, they are building a foundation for a brighter future..."
    
    Now, write the profile for ${student.name}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    // Handle the case where the API response might not contain text.
    return response.text ?? `Could not generate a profile for ${student.name}. The AI returned no text.`;
  } catch (error) {
    console.error(`Error generating profile for ${student.name}:`, error);
    // Re-throw the original error so the UI layer can inspect it and decide
    // if it's a retryable error (e.g., 503).
    throw error;
  }
};