
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

/**
 * Service to interact with Gemini AI using the official SDK.
 */
export const askMilitaryAdvisor = async (
  query: string,
  state: AppState
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Sei un assistente virtuale esperto di logistica e regolamenti della Marina Militare Italiana.
    
    CONTESTO NORMATIVO CORRETTO:
    - Licenza Ordinaria: 39 gg/anno.
    - Legge 937: 4 gg/anno (da consumare entro l'anno solare).
    - Recupero Compensativo (Banca Ore): maturato 1:1 per ore di straordinario prestate e non retribuite. Scade solitamente entro 12-24 mesi (riferimento DPR).
    - Recupero Riposo (RRF): maturato solo se si lavora di DOMENICA o FESTIVO (indipendentemente dalle ore). Si matura esattamente 1 GIORNO di recupero per la ripresa del riposo, oltre alle ore prestate in banca ore.
    - Sabato: è considerato giorno feriale (o non lavorativo in settimana corta), ma NON dà diritto al recupero della giornata (RRF), solo alle ore di straordinario.
    - Guardie: Feriali (+8h, +30€ circa), Festive (+24h, +90€ circa).
    
    DATI UTENTE ATTUALI:
    - Grado: ${state.user.rank} ${state.user.name}
    - Licenza Ordinaria: ${state.balances.ordinaria} gg
    - Legge 937: ${state.balances.legge937} gg
    - Recupero Riposo: ${state.balances.recuperoRiposo} gg
    - Banca Ore: ${state.balances.hoursBank} ore
    - Compensi: € ${state.balances.moneyBank}
    
    CORREZIONE ERRORI COMUNI:
    - NON esistono bonus di 3 giorni per lo straordinario nel weekend.
    - Il recupero è sempre 1:1 (ore) + 1 giorno (solo se domenica/festivo).
    
    Rispondi in modo formale ("Comandi", "Signorsì") ma chiaro. Sii conciso.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: query }] }],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "Il modello ha generato una risposta vuota.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.status === 400) return "Errore 400: Richiesta malformata o chiave invalida.";
    if (error.status === 401) return "Errore 401: Non autorizzato.";
    if (error.status === 429) return "Errore 429: Rate limit raggiunto.";
    return `Errore di connessione: ${error.message || 'Verifica la tua connessione.'}`;
  }
};
