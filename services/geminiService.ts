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

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;


export const fetchQuestions = async (grade: GradeLevel, lang: Language, count: number = 3): Promise<MathQuestion[]> => {
  const modelName = "gemini-2.5-flash";

  const langInstruction = lang === 'en' 
    ? "Generate content in English." 
    : "Genera el contenido en Español neutro.";

  const prompt = `
${langInstruction}

Actúa como un diseñador experto de problemas matemáticos escolares y de olimpiadas.

Genera ${count} preguntas de matemáticas DIFERENTES ENTRE SÍ para alumnos de ${grade} de primaria.

REGLAS OBLIGATORIAS:
- Las preguntas DEBEN AJUSTARSE estrictamente al nivel ${grade}.
- A MAYOR grado → MAYOR dificultad.
- Para 4° y 5° primaria, PROHÍBE sumas y restas simples.
- NO repitas estructuras ni ideas entre preguntas.
- NO reutilices preguntas típicas (manzanas, sumas directas, conteo básico).
- Cada pregunta debe requerir razonamiento, no cálculo directo.

TIPOS DE PROBLEMAS (mezclar obligatoriamente):
- Lógica matemática
- Series y patrones no evidentes
- Problemas verbales con varias condiciones
- Razonamiento proporcional
- Geometría básica aplicada
- Pensamiento estratégico (tipo acertijo)

FORMATO DE SALIDA (ESTRICTO):
Devuelve SOLO un array JSON. Nada de texto adicional.

Cada objeto debe tener exactamente esta estructura:
{
  "id": "string único",
  "questionText": "string",
  "options": ["A", "B", "C", "D"],
  "correctAnswerIndex": number,
  "explanation": "explicación clara y corta",
  "difficulty": "easy | medium | hard"
}

REGLAS EXTRA IMPORTANTES:
- No repitas preguntas entre ejecuciones.
- Usa contextos variados (tiempo, dinero, figuras, juegos, historias).
- Usa emojis SOLO si aportan claridad (máx. 1 por pregunta).
`;


  try {
    // 1. Initialize API Client HERE instead of at the top of the file.
    // This prevents the "White Screen of Death" if the key is missing on load.
   const apiKey = import.meta.env.GEMINI_API_KEY;
    
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