
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey });

export const generateConcept = async (idea: string): Promise<string> => {
  if (!idea.trim()) {
    return Promise.reject(new Error("Idea cannot be empty."));
  }

  const prompt = `You are a creative director for a professional photographer. Based on the following user request, generate a short, inspiring creative concept or mood board description for a photoshoot. Keep it to 2-3 sentences and write in a poetic, evocative style. User request: "${idea}"`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.8,
          topP: 1,
          topK: 32,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Provide a more user-friendly error message
    throw new Error("Failed to generate a creative concept. The AI may be currently unavailable.");
  }
};
