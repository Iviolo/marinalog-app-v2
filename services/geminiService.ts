import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const askMilitaryAdvisor = async (
  query: string,
  state: AppState,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    return "Errore: Chiave API non fornita. Inseriscila per attivare l'assistente.";
  }
  
  const ai = new GoogleGenAI({ apiKey });

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
    Se l'utente chiede calcoli complessi, spiegali passo passo.
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
    return "Si è verificato un errore di comunicazione. Verifica che la tua API Key sia valida e abbia credito sufficiente.";
  }
};