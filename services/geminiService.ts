import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

const getAiClient = () => {
  if (!"AIzaSyBNCf0dmzdrk3UjQzif6JWaV7jAhle-GM") {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: "AIzaSyBNCf0dmzdrk3UjQzif6JWaV7jAhle-GM" });
};

export const askMilitaryAdvisor = async (
  query: string,
  state: AppState
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Errore: Chiave API non configurata. Impossibile contattare l'assistente.";

  const systemInstruction = `
    Sei un assistente virtuale esperto di logistica e regolamenti della Marina Militare Italiana.
    Hai accesso ai dati attuali dell'utente (ferie, permessi, guardie).
    
    Dati Utente Attuali:
    - Grado: ${state.user.rank} ${state.user.name}
    - Saldo Licenza Ordinaria: ${state.balances.ordinaria} giorni
    - Saldo 937: ${state.balances.legge937} giorni
    - Banca Ore (Recuperi): ${state.balances.hoursBank} ore
    - Credito Monetario (Guardie): ${state.balances.moneyBank} Euro
    - Malattia residua: ${state.balances.malattia} giorni
    
    Regole di base:
    - Ordinaria: 39 giorni/anno.
    - L.937: 4 giorni/anno.
    - Guardie: Lun-Gio (+8h, +30€), Sab-Dom/Festivi (+24h, +90€).
    - Recuperi: Lun-Gio (-8h), Ven (-4h).
    
    Rispondi in modo formale ma cordiale, tipico dell'ambiente militare ("Comandi", "Affermativo").
    Sii conciso e diretto. Usa la formattazione Markdown per le liste.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text || "Non ho ricevuto una risposta valida.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Si è verificato un errore di comunicazione con il comando centrale (API Error).";
  }
};