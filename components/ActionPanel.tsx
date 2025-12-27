
import React, { useState, useEffect } from 'react';
import { LogType, AppState, LogEntry, CustomField } from '../types';
import { Calendar as CalendarIcon, Clock, Save, AlertCircle, Plus, Minus, Edit, Coffee, Info } from 'lucide-react';

interface ActionPanelProps {
  state: AppState;
  onAddEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ state, onAddEntry }) => {
  const [type, setType] = useState<LogType>('ordinaria');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [overtimeHours, setOvertimeHours] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [customFieldId, setCustomFieldId] = useState('');
  
  const [rettificaTarget, setRettificaTarget] = useState('ordinaria');
  const [rettificaOp, setRettificaOp] = useState<'add'|'subtract'>('add');
  const [rettificaQty, setRettificaQty] = useState<number>(1);

  const [calculatedInfo, setCalculatedInfo] = useState<{hours: number, money: number, isSunday: boolean, isSaturday: boolean} | null>(null);

  useEffect(() => {
    const dayOfWeek = new Date(date).getDay(); // 0=Sun, 6=Sat
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    let hours = 0;
    let money = 0;

    if (type === 'guardia') {
        if (isSunday || isSaturday) {
            hours = 24;
            money = 90;
        } else {
            hours = 8;
            money = 30;
        }
    } else if (type === 'recupero') {
        if (new Date(date).getDay() === 5) hours = -4; // Ven
        else hours = -8; // Altri feriali
    } else if (type === 'permesso') {
        const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        hours = Math.max(0, (end - start) / 60);
    } else if (type === 'straordinario') {
        hours = overtimeHours;
    }

    setCalculatedInfo({ hours, money, isSunday, isSaturday });
  }, [type, date, startTime, endTime, overtimeHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let quantity = (type === 'ordinaria' || type === 'legge937' || type === 'malattia') ? 1 : calculatedInfo?.hours || 0;
    if (type === 'rettifica') quantity = rettificaOp === 'add' ? rettificaQty : -rettificaQty;

    onAddEntry({
        date,
        type,
        quantity,
        moneyAccrued: calculatedInfo?.money || 0,
        notes,
        targetBalance: type === 'rettifica' ? rettificaTarget : undefined,
        startTime: type === 'permesso' ? startTime : undefined,
        endTime: type === 'permesso' ? endTime : undefined,
        customFieldId: type === 'custom' ? customFieldId : undefined
    });
    setNotes('');
  };

  const options: { id: LogType; label: string; color: string; customId?: string }[] = [
    { id: 'ordinaria', label: 'Licenza Ordinaria', color: 'bg-blue-600' },
    { id: 'legge937', label: 'Legge 937', color: 'bg-yellow-600' },
    { id: 'straordinario', label: 'Straordinario', color: 'bg-indigo-600' },
    { id: 'guardia', label: 'Guardia', color: 'bg-purple-600' },
    { id: 'recupero', label: 'Recupero Ore', color: 'bg-emerald-600' },
    { id: 'permesso', label: 'Permesso', color: 'bg-orange-600' },
    { id: 'rettifica', label: 'Rettifica Saldi', color: 'bg-pink-600' },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg animate-slide-up pb-24 lg:pb-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Save className="text-gold-500" />
        Registra Attività
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
           {options.map((opt) => (
               <button
                key={opt.id} type="button" onClick={() => setType(opt.id)}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent 
                  ${type === opt.id ? `${opt.color} text-white border-white/20 shadow-lg` : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
               >
                 {opt.label}
               </button>
           ))}
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-sm font-medium">Data Evento</label>
          <input 
            type="date" required value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-gold-500 outline-none"
          />
        </div>

        {type === 'straordinario' && (
          <div className="space-y-2">
             <label className="text-slate-400 text-sm">Ore Straordinario (Compensativo 1:1)</label>
             <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                <input 
                  type="number" step="0.5" min="0" required value={overtimeHours}
                  onChange={(e) => setOvertimeHours(parseFloat(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
          </div>
        )}

        <div className="space-y-2">
            <label className="text-slate-400 text-sm font-medium">Note</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Dettagli attività..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-gold-500 outline-none min-h-[60px]"
            />
        </div>

        {/* RECAP NORMATIVO DINAMICO */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700 flex items-start gap-3">
            <AlertCircle className="text-gold-500 mt-1 flex-shrink-0" size={20} />
            <div className="text-sm text-slate-300">
                <p className="font-bold text-white mb-1">Applicazione Normativa:</p>
                <ul className="space-y-1">
                    {type === 'straordinario' && (
                        <>
                          <li className="flex items-center gap-2">
                             <Clock size={14} className="text-indigo-400"/> 
                             Recupero Compensativo: <strong>+{calculatedInfo?.hours} ore</strong>
                          </li>
                          {calculatedInfo?.isSunday ? (
                            <li className="flex items-center gap-2 text-emerald-400 font-bold">
                               <Coffee size={14}/> 
                               Recupero Riposo (RRF): <strong>+1 Giorno</strong>
                            </li>
                          ) : calculatedInfo?.isSaturday ? (
                            <li className="flex items-center gap-2 text-slate-400 italic">
                               <Info size={14}/> Sabato feriale: nessun recupero giornata extra.
                            </li>
                          ) : null}
                          <li className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                             Scadenza: 31/12/{(parseInt(date.substring(0,4)) + 1)}
                          </li>
                        </>
                    )}
                    {type === 'ordinaria' && <li>Consumo di 1 giorno di Licenza Ordinaria.</li>}
                    {type === 'guardia' && <li>Accredito ore ({calculatedInfo?.hours}h) + Compenso ({calculatedInfo?.money}€).</li>}
                </ul>
            </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-900 font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95"
        >
          Registra Evento
        </button>
      </form>
    </div>
  );
};

export default ActionPanel;
