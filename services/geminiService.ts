import { AppState } from "../types";

export const askMilitaryAdvisor = async (
  query: string,
  state: AppState,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    return "Errore: Chiave API non fornita. Inseriscila per attivare l'assistente.";
  }

  // Costruzione del contesto e istruzioni di sistema
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

  // Endpoint REST API come richiesto (gemini-1.5-flash)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: query }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", response.status, errorData);

      if (response.status === 400) {
        return "Errore 400: Richiesta malformata. Verifica che l'API Key sia corretta e attiva (Key invalida).";
      }
      if (response.status === 401) {
        return "Errore 401: Non autorizzato. La chiave API non è valida.";
      }
      if (response.status === 403) {
        return "Errore 403: Accesso negato. La tua chiave potrebbe non avere i permessi o il credito necessario.";
      }
      if (response.status === 429) {
        return "Errore 429: Troppe richieste. Riprova tra qualche istante.";
      }
      if (response.status >= 500) {
        return "Errore Server Google (5xx). Riprova più tardi.";
      }
      
      return `Errore API (${response.status}): ${errorData.error?.message || 'Errore sconosciuto'}`;
    }

    const data = await response.json();
    
    // Estrazione testo dalla risposta
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      return text;
    } else {
      return "Il modello ha generato una risposta vuota.";
    }

  } catch (error) {
    console.error("Network Error:", error);
    return "Errore di connessione. Verifica di essere collegato a internet.";
  }
};