
import React from 'react';
import { AppState, LogEntry } from '../types';
import { Trash2, FileText } from 'lucide-react';

interface HistoryProps {
  state: AppState;
  onDelete: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ state, onDelete }) => {

  const getBalanceLabel = (key: string) => {
      if (key === 'ordinaria') return 'Licenza Ordinaria';
      if (key === 'legge937') return 'Legge 937';
      if (key === 'malattia') return 'Malattia';
      if (key === 'hoursBank') return 'Banca Ore';
      if (key === 'moneyBank') return 'Compensi';
      const custom = state.customFields.find(f => f.id === key);
      return custom ? custom.name : key;
  };

  const getBalanceUnit = (key: string) => {
      if (key === 'moneyBank') return '€';
      if (key === 'hoursBank') return 'h';
      return ''; // Default days usually implied
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg pb-24 lg:pb-6">
      <h2 className="text-xl font-bold text-white mb-6">Storico Movimenti</h2>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {state.history.length === 0 ? (
          <div className="text-center text-slate-500 py-10">Nessun movimento registrato.</div>
        ) : (
          state.history.map((entry) => (
            <div key={entry.id} className="group bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide
                    ${entry.type === 'ordinaria' ? 'bg-blue-500/20 text-blue-400' :
                      entry.type === 'guardia' ? 'bg-purple-500/20 text-purple-400' :
                      entry.type === 'malattia' ? 'bg-red-500/20 text-red-400' :
                      entry.type === 'rettifica' ? 'bg-pink-500/20 text-pink-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                    {entry.type}
                  </span>
                  <span className="text-slate-400 text-sm">{entry.date}</span>
                </div>
                <div className="text-white font-medium">
                    {entry.type === 'permesso' ? `Permesso orario (${entry.quantity.toFixed(1)}h)` : 
                     entry.type === 'guardia' ? `Guardia (+${entry.quantity}h / +${entry.moneyAccrued}€)` :
                     entry.type === 'recupero' ? `Recupero (-${entry.quantity}h)` :
                     entry.type === 'rettifica' && entry.targetBalance ? 
                        `Rettifica ${getBalanceLabel(entry.targetBalance)}: ${entry.quantity > 0 ? '+' : ''}${entry.quantity}${getBalanceUnit(entry.targetBalance)}` :
                     `${entry.quantity} Giorno`}
                </div>
                {entry.notes && (
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <FileText size={12} />
                    {entry.notes}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => onDelete(entry.id)}
                className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Elimina voce e ripristina saldo"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
