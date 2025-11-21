
export type LogType = 
  | 'ordinaria' 
  | 'legge937' 
  | 'malattia' 
  | 'guardia' 
  | 'recupero' 
  | 'permesso' 
  | 'custom'
  | 'rettifica';

export interface CustomField {
  id: string;
  name: string;
  unit: 'giorni' | 'ore';
  balanceEffect: 'add' | 'subtract' | 'none';
  initialBalance?: number;
  color: string;
}

export interface LogEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  type: LogType;
  customFieldId?: string; // If type is custom
  targetBalance?: string; // If type is rettifica, keys of balances
  quantity: number; // days or hours
  moneyAccrued: number; // specifically for Guardie
  startTime?: string; // HH:mm for permits
  endTime?: string; // HH:mm for permits
  notes: string;
  timestamp: number;
}

export interface AppState {
  balances: {
    ordinaria: number;
    legge937: number;
    malattia: number;
    hoursBank: number; // Ore recupero accumulate/spese
    moneyBank: number; // Euro accumulati
    [key: string]: number; // For custom fields balances
  };
  history: LogEntry[];
  customFields: CustomField[];
  user: {
    name: string;
    rank: string;
    avatarUrl?: string;
  };
}

export const INITIAL_STATE: AppState = {
  balances: {
    ordinaria: 39,
    legge937: 4,
    malattia: 45,
    hoursBank: 0,
    moneyBank: 0,
  },
  history: [],
  customFields: [],
  user: {
    name: "Mario Rossi",
    rank: "Capo di 1ª Classe",
    avatarUrl: "https://picsum.photos/200",
  }
};
