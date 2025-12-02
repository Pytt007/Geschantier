
// Fix: Removed unused 'Type' import.
import { GoogleGenAI } from "@google/genai";

// Fix: Aligned with Gemini API guidelines to use process.env.API_KEY directly
// and removed API_KEY constant, fallback logic, and console warning.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyReport = async (points: string): Promise<string> => {
  // Fix: Removed unnecessary check for API_KEY existence as per guidelines.
  try {
    const prompt = `Tu es un chef de chantier expérimenté. En te basant sur les points clés suivants, rédige un rapport de chantier quotidien clair, professionnel et bien structuré au format Markdown. Le rapport doit inclure une section 'Progression des Travaux', 'Problèmes Rencontrés' et 'Plan pour Demain'.

Points clés :
${points}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error generating daily report:", error);
    return "Une erreur est survenue lors de la génération du rapport. Veuillez vérifier la console pour plus de détails.";
  }
};


export const analyzeRisks = async (situation: string): Promise<string> => {
    // Fix: Removed unnecessary check for API_KEY existence as per guidelines.
    try {
        const prompt = `En tant qu'expert en sécurité sur les chantiers de construction (HSE), identifie les risques potentiels associés à la situation suivante. Pour chaque risque, décris-le, évalue son niveau de gravité (Faible, Moyen, Élevé) et propose des mesures de prévention ou de mitigation concrètes. Présente l'analyse sous forme de tableau Markdown.

Situation :
${situation}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });

        return response.text;

    } catch (error) {
        console.error("Error analyzing risks:", error);
        return "Une erreur est survenue lors de l'analyse des risques. Veuillez vérifier la console pour plus de détails.";
    }
};
