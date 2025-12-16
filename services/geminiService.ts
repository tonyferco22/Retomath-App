import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GradeLevel, MathQuestion, Language } from "../types";

// Schema definition for structured output
const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      questionText: {
        type: Type.STRING,
        description: "The text of the math problem.",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of 3 or 4 possible answers.",
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: "The index (0-based) of the correct answer in the options array.",
      },
      explanation: {
        type: Type.STRING,
        description: "A short explanation of why the answer is correct.",
      },
      difficulty: {
        type: Type.STRING,
        enum: ["easy", "medium", "hard"],
        description: "The difficulty level of the question.",
      }
    },
    required: ["questionText", "options", "correctAnswerIndex", "explanation", "difficulty"],
  },
};

// Helper function to safely get the API key without crashing the browser
const getApiKey = () => {
  try {
    // Check if process exists (Node/Build env) and has the key
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors if process is not defined in browser
  }
  return "";
};

export const fetchQuestions = async (grade: GradeLevel, lang: Language, count: number = 3): Promise<MathQuestion[]> => {
  const modelName = "gemini-2.5-flash";

  const langInstruction = lang === 'en' 
    ? "Generate content in English." 
    : "Genera el contenido en Español neutro.";

  const prompt = `
    ${langInstruction}
    Genera ${count} preguntas de matemáticas tipo "Concurso" o "Olimpiada Matemática" para niños de ${grade}.
    
    Requisitos:
    1. Las preguntas NO deben ser simples sumas o restas (ej: "2+2").
    2. Deben ser problemas de lógica, patrones, series, problemas verbales o geometría básica adecuada para la edad.
    3. Hazlas divertidas e interesantes, usa Emojis en el texto.
    4. Devuelve estrictamente un array JSON.
  `;

  try {
    // 1. Initialize API Client HERE instead of at the top of the file.
    // This prevents the "White Screen of Death" if the key is missing on load.
    const apiKey = getApiKey();
    
    if (!apiKey) {
      console.warn("API Key is missing. Using offline mode.");
      throw new Error("Missing API Key");
    }

    const ai = new GoogleGenAI({ apiKey });

    // 2. Make the request
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: `You are an expert math tutor for elementary school kids. ${langInstruction}`,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const rawData = response.text;
    if (!rawData) throw new Error("No data received from Gemini");

    const parsedData = JSON.parse(rawData);
    
    return parsedData.map((q: any, index: number) => ({
      ...q,
      id: `${Date.now()}-${index}`,
    }));

  } catch (error) {
    console.error("Error fetching questions (Using Fallback):", error);
    
    // FALLBACK QUESTIONS (OFFLINE MODE)
    // Used if API Key is missing or quota is exceeded
    const isEs = lang === 'es';
    
    const fallbacks: MathQuestion[] = [
      {
        id: "fb-1",
        questionText: isEs ? "Si tienes 3 manzanas y compras 2 más, ¿cuántas tienes?" : "If you have 3 apples and buy 2 more, how many do you have?",
        options: ["4", "5", "6"],
        correctAnswerIndex: 1,
        explanation: isEs ? "3 más 2 es igual a 5." : "3 plus 2 equals 5.",
        difficulty: "easy"
      },
      {
        id: "fb-2",
        questionText: isEs ? "¿Qué número sigue en la serie? 2, 4, 6, 8..." : "What number comes next? 2, 4, 6, 8...",
        options: ["9", "10", "12"],
        correctAnswerIndex: 1,
        explanation: isEs ? "La serie va de 2 en 2." : "The pattern is adding 2.",
        difficulty: "easy"
      },
      {
        id: "fb-3",
        questionText: isEs ? "Tengo 4 patas pero no puedo caminar. ¿Qué soy?" : "I have 4 legs but cannot walk. What am I?",
        options: [isEs ? "Un perro" : "A dog", isEs ? "Una mesa" : "A table", isEs ? "Un pato" : "A duck"],
        correctAnswerIndex: 1,
        explanation: isEs ? "Las mesas tienen patas pero son muebles." : "Tables have legs but are furniture.",
        difficulty: "medium"
      }
    ];

    return fallbacks;
  }
};