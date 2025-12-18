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

const apiKey = import.meta.env.GEMINI_API_KEY;


export const fetchQuestions = async (grade: GradeLevel, lang: Language, count: number = 3): Promise<MathQuestion[]> => {
  const modelName = "gemini-2.5-flash";

  const langInstruction = lang === 'en' 
    ? "Generate content in English." 
    : "Genera el contenido en Español neutro.";

  const prompt = `
${langInstruction}

Eres un profesor experto en matemáticas para niños y diseñadores de problemas tipo concurso.

TAREA:
Genera EXACTAMENTE ${count} preguntas de matemáticas para estudiantes de ${grade} de primaria.

DIFICULTAD (MUY IMPORTANTE):
- 1° Primaria: lógica simple, conteo, comparaciones, patrones cortos, problemas de suma, resta, doble y mitad.
- 2° Primaria: patrones, sumas encadenadas, problemas verbales simples, problemas de doble, mitad y multiplicaciones de una cifra.
- 3° Primaria: series numéricas, lógica, problemas verbales con 2 pasos, problemas de cuatro operaciones (suma, resta, multiplicación y división), problemas con operaciones continuas.
- 4° Primaria: razonamiento lógico, patrones complejos, geometría básica, problemas con operaciones continuas (de 2 a 4 pasos), problemas tipo CONAMAT y Canguro Matemático.
- 5° Primaria: razonamiento avanzado, fracciones simples, múltiplos, divisibilidad, lógica tipo acertijo, problemas de olimpiadas nacionales e internacionales.

REGLAS OBLIGATORIAS:
1. PROHIBIDO usar preguntas básicas como "2+2", "3+5", etc.
2. Cada pregunta debe ser DIFERENTE entre sí (no repitas estructuras).
3. No reutilices preguntas típicas como “tengo 3 manzanas…”.
4. Las preguntas deben ser retadoras pero comprensibles para el grado.
5. Usa contexto divertido o interesante (historias, juegos, retos).
6. Usa emojis con moderación (máx. 1 por pregunta).
7. Cada pregunta debe tener exactamente 3 opciones.
8. Solo UNA opción correcta.
9. No expliques el proceso paso a paso, solo una explicación corta y clara.

FORMATO DE SALIDA (OBLIGATORIO):
Devuelve ÚNICAMENTE un array JSON válido con esta estructura exacta:

[
  {
    "id": "q-1",
    "questionText": "texto de la pregunta",
    "options": ["opción A", "opción B", "opción C"],
    "correctAnswerIndex": 0,
    "explanation": "explicación corta",
    "difficulty": "easy | medium | hard"
  }
]

NO incluyas texto adicional.
NO incluyas comentarios.
NO incluyas markdown.
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