
import { GoogleGenAI } from "@google/genai";
import type { Student } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // Here, we'll rely on the environment providing the key.
  console.warn("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateStudentProfileText = async (student: Student): Promise<string> => {
  const prompt = `
    Generate a warm, inspiring, and positive one-paragraph profile for a student for "Sarjan Foundation", an NGO that supports underprivileged youth with vocational training. The tone should be hopeful, highlighting the student's resilience and potential.

    Weave the following details into a short, compelling narrative. Focus on their strengths and aspirations. Do not just list the facts.

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

    Example tone: "Meet ${student.name}, a determined ${student.age}-year-old from ${student.center}. Despite facing challenges, ${student.name} has shown great promise in their studies in ${student.trade}. With the support of Sarjan Foundation, they are building a foundation for a brighter future..."
    
    Now, write the profile for ${student.name}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating student profile:", error);
    return `An error occurred while generating the profile for ${student.name}. Please try again.`;
  }
};
