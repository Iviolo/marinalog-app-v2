
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

/**
 * Service to interact with Gemini AI using the official SDK.
 * Strictly constrained by military regulatory extracts.
 */
export const askMilitaryAdvisor = async (
  query: string,
  state: AppState
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Sei il "Consigliere Navale", un assistente basato RIGIDAMENTE sulla normativa militare per la gestione del personale.
    
    ESTRATTO NORMATIVO DI RIFERIMENTO (USA SOLO QUESTO):
    1. RECUPERO COMPENSATIVO: Rapporto 1:1 rispetto alle ore prestate e non retribuite. 
       - Esempio: 3 ore di straordinario = 3 ore di recupero in banca ore.
    2. RECUPERO RIPOSO/FESTIVO (RRF): Matura solo se si presta servizio di DOMENICA o nei GIORNI FESTIVI infrasettimanali.
       - Quantità: Matura sempre e solo 1 GIORNO di recupero, indipendentemente dalle ore fatte.
       - Sabato: Il sabato NON fa maturare il recupero della giornata di riposo, ma solo le ore di straordinario (1:1).
    3. SCADENZA: I recuperi devono essere fruiti entro il 31 dicembre dell'anno successivo a quello di maturazione.
    4. INDENNITÀ ECONOMICHE: Il servizio festivo può dare diritto all'indennità di presenza festiva o allo straordinario festivo pagato (se autorizzato e non convertito in recupero).
    
    REGOLA DA SMENTIRE CATEGORICAMENTE:
    - Non esiste alcun "bonus di 3 giorni" per lo straordinario nel weekend. È un errore interpretativo. La normativa prevede solo il recupero 1:1 delle ore e 1 giorno di riposo per la domenica/festivo.

    DATI UTENTE ATTUALI:
    - Grado/Nome: ${state.user.rank} ${state.user.name}
    - Banca Ore: ${state.balances.hoursBank} ore
    - Recupero Riposo (RRF): ${state.balances.recuperoRiposo} giorni
    - Licenza Ordinaria: ${state.balances.ordinaria} gg
    
    RISPOSTA:
    - Sii formale e preciso.
    - Se l'utente chiede del "bonus 3 giorni", spiega pacatamente che non è previsto dalla normativa e che l'app segue le regole ufficiali 1:1 + RRF.
    - Rispondi con "Comandi" o "Signorsì" dove appropriato.
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
    return `Errore di connessione: ${error.message || 'Servizio momentaneamente non disponibile.'}`;
  }
};
