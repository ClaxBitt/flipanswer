import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { titulo, preguntas, config } = await request.json();

    if (!preguntas || preguntas.length === 0) {
      return NextResponse.json({ error: 'No hay material base' }, { status: 400 });
    }

    // 1. TRUCO DE VARIABILIDAD: Mezclamos el orden de las preguntas originales aleatoriamente
    // De esta forma, Gemini recibirá un orden diferente en cada intento y seleccionará preguntas distintas.
    const preguntasAleatorias = [...preguntas].sort(() => Math.random() - 0.5);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const cantidad = config?.cantidad || 5;
    const dificultad = config?.dificultad || 'Intermedio';
    const enfoque = config?.enfoque || 'General';
    const formato = config?.formato || 'Directo/Teórico';
    const idioma = config?.idioma || 'Español';

    // Generamos un identificador único para romper la memoria estática de la IA
    const seedAleatoria = Math.floor(Math.random() * 100000);

    const prompt = `
      Actúa como un riguroso profesor universitario de medicina. Basándote ÚNICAMENTE en las siguientes preguntas y respuestas del cuestionario titulado "${titulo}", genera un examen interactivo de opción múltiple.

      Material de estudio original (Orden mezclado para este intento):
      ${JSON.stringify(preguntasAleatorias)}

      PARÁMETROS DEL EXAMEN:
      - Cantidad máxima de preguntas a generar: ${cantidad}
      - Nivel de dificultad exigido: ${dificultad}
      - Enfoque de la evaluación: ${enfoque}
      - Formato de las preguntas: ${formato}
      - Idioma: ${idioma}
      - Semilla de aleatoriedad del intento: ${seedAleatoria}

      INSTRUCCIONES ESTRICTAS DE VARIABILIDAD:
      - Utiliza la 'Semilla de aleatoriedad: ${seedAleatoria}' para seleccionar un conjunto de conceptos, preguntas y respuestas COMPLETAMENTE DIFERENTE al de intentos anteriores. Evita repetir las mismas preguntas si el material base permite extraer otras.
      
      INSTRUCCIONES DE FORMATO:
      1. Las opciones deben ser plausibles pero solo una debe ser médicamente correcta según el texto provisto.
      2. No inventes datos que no vengan explícitos en el material provisto.
      3. Redacta una breve "explicacion" justificando por qué la opción correcta lo es, basándote en el material.
      4. El campo "respuestaCorrecta" debe ser el índice numérico (0, 1, 2 o 3).

      Debes responder ÚNICAMENTE con un arreglo JSON bajo la siguiente estructura exacta:
      [
        {
          "pregunta": "Texto de la pregunta generada",
          "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "respuestaCorrecta": 0,
          "explicacion": "Justificación breve de la respuesta..."
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return NextResponse.json({ success: true, test: JSON.parse(responseText) });
  } catch (error) {
    console.error("Error en Gemini API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}