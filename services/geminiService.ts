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
        questionText: isEs ? "Si tienes 7 manzanas y compras 12 más, ¿cuántas tienes?" : "If you have 7 apples and buy 12 more, how many do you have?",
        options: ["16", "19", "18"],
        correctAnswerIndex: 1,
        explanation: isEs ? "7 más 12 es igual a 19." : "7 plus 12 equals 19.",
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
      },
        
      {
        id: "fb-4",
        questionText: isEs ? "¿Qué número sigue en la serie? 2, 4, 8, 16..." : "What number comes next? 2, 4, 8, 16...",
        options: ["20", "32", "24"],
        correctAnswerIndex: 1,
        explanation: isEs ? "La serie va de 2 en 2." : "The pattern is adding 2.",
        difficulty: "medium"
      },
      {
        id: "fb-5",
        questionText: isEs ? "Tengo 4 perros y 3 pollos. Cuántas patas hay en total?" : "I have 4 dogs and 3 chickens. how many foots may have?",
        options:  ["20", "22", "24"],
        correctAnswerIndex: 1,
        explanation: isEs ? "4x4 + 3x2 = 22." : "4x4 + 3x2 = 22.",
        difficulty: "medium"
      },
      {
        id: "fb-6",
        questionText: isEs ? "Tengo 4 arañas. ¿Cuántas patas contaré?" : "I have 4 spiders. How many legs they have?",
        options: ["20", "32", "24"],
        correctAnswerIndex: 1,
        explanation: isEs ? "4x8 =32." : "4x8 =32",
        difficulty: "medium"
      },
      {
        id: "fb-7",
        questionText: isEs ? "Tengo 34 manzanas y me comí la mitad. ¿Cuántas quedan?" : "I have 34 aples and eat half. How many have now?",
        options: ["18", "17", "14"],
        correctAnswerIndex: 1,
        explanation: isEs ? "34/2 = 17." : "34/2 = 17.",
        difficulty: "medium"
      },
      {
        id: "fb-8",
        questionText: isEs ? "Tengo 36 peras y regalé 8. ¿Cuántas me quedan?" : "Tengo 36 peras y regalé 8. ¿Cuántas me quedan?",
        options: ["28", "17", "24"],
        correctAnswerIndex: 1,
        explanation: isEs ? "36-8 =28." : "36-8 =28.",
        difficulty: "medium"
      },
      {
        id: "fb-9",
        questionText: isEs ? "Tengo 4 mesas, cada mesa tiene 6 sillas. ¿Cuantas personas podrán sentarse en total?" : "Tengo 4 mesas, cada mesa tiene 6 sillas. ¿Cuantas personas podrán sentarse en total?",
        options: ["28", "17", "24"],
        correctAnswerIndex: 1,
        explanation: isEs ? "6x4 = 24." : "6x4 = 24.",
        difficulty: "medium"
      },
      {
        id: "fb-10",
        questionText: isEs ? "¿Cuántos lados tiene un triángulo?" : "How many sides have a triangle?",
        options: ["3", "4", "5"],
        correctAnswerIndex: 1,
        explanation: isEs ? "3." : "3.",
        difficulty: "medium"
      },
      {
        id: "fb-10",
        questionText: isEs ? "¿Cuántos lados tiene un pentágono?" : "How many sides have a pentagon?",
        options: ["3", "4", "5"],
        correctAnswerIndex: 1,
        explanation: isEs ? "5." : "5.",
        difficulty: "medium"
      },
      {
        id: "fb-10",
        questionText: isEs ? "¿Cuántos lados tiene un decágono?" : "How many sides have a decagon?",
        options: ["9", "10", "11"],
        correctAnswerIndex: 1,
        explanation: isEs ? "10." : "10.",
        difficulty: "medium"
      },
      {
        id: "fb-13",
        questionText: isEs ? "¿Cuánto es: 15 - 7 x 2?" : "¿Cuánto es: 15 - 7 x 2?",
        options: ["16", "1", "15"],
        correctAnswerIndex: 1,
        explanation: isEs ? "Las mesas tienen patas pero son muebles." : "Tables have legs but are furniture.",
        difficulty: "medium"
      },
      {
        id: "fb-2",
        questionText: isEs ? "¿Qué número sigue en la serie? 2, 6, 10, 14..." : "What number comes next? 2, 6, 10, 14...",
        options: ["19", "18", "17"],
        correctAnswerIndex: 1,
        explanation: isEs ? "La serie va de 4 en 4." : "The pattern is adding 4.",
        difficulty: "easy"
      },
    ];

    return fallbacks;
  }
};