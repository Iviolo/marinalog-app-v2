
import React, { useState, useEffect } from 'react';
import { LogType, AppState, LogEntry, CustomField } from '../types';
import { Calendar as CalendarIcon, Clock, Save, AlertCircle, Sliders, Plus, Minus, Edit, Star, Coffee } from 'lucide-react';

interface ActionPanelProps {
  state: AppState;
  onAddEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ state, onAddEntry }) => {
  const [type, setType] = useState<LogType>('ordinaria');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [overtimeHours, setOvertimeHours] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [customFieldId, setCustomFieldId] = useState<string>('');
  
  const [rettificaTarget, setRettificaTarget] = useState<string>('ordinaria');
  const [rettificaOp, setRettificaOp] = useState<'add'|'subtract'>('add');
  const [rettificaQty, setRettificaQty] = useState<number>(1);

  const [calculatedInfo, setCalculatedInfo] = useState<{hours: number, money: number, isSunday: boolean} | null>(null);

  useEffect(() => {
    const dayOfWeek = new Date(date).getDay(); // 0=Sun, 6=Sat
    const isSunday = dayOfWeek === 0;
    let hours = 0;
    let money = 0;

    if (type === 'guardia') {
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            hours = 24;
            money = 90;
        } else {
            hours = 8;
            money = 30;
        }
    } else if (type === 'recupero') {
        if (dayOfWeek === 5) { // Friday
            hours = -4;
        } else if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Mon-Thu
            hours = -8;
        }
    } else if (type === 'permesso') {
        const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        hours = Math.max(0, (end - start) / 60);
    } else if (type === 'straordinario') {
        hours = overtimeHours;
    }

    setCalculatedInfo({ hours, money, isSunday });
  }, [type, date, startTime, endTime, overtimeHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let quantity = 0;
    let moneyAccrued = 0;
    let targetBalance: string | undefined;

    if (type === 'ordinaria' || type === 'legge937' || type === 'malattia') {
        quantity = 1;
    } else if (type === 'guardia' || type === 'straordinario' || type === 'permesso') {
        quantity = calculatedInfo?.hours || 0;
        moneyAccrued = calculatedInfo?.money || 0;
    } else if (type === 'recupero') {
        quantity = Math.abs(calculatedInfo?.hours || 0);
    } else if (type === 'custom') {
        quantity = 1;
    } else if (type === 'rettifica') {
        quantity = rettificaOp === 'add' ? Math.abs(rettificaQty) : -Math.abs(rettificaQty);
        targetBalance = rettificaTarget;
    }

    onAddEntry({
        date,
        type,
        quantity,
        moneyAccrued,
        notes,
        targetBalance,
        startTime: type === 'permesso' ? startTime : undefined,
        endTime: type === 'permesso' ? endTime : undefined,
        customFieldId: type === 'custom' ? customFieldId : undefined
    });

    setNotes('');
    setRettificaQty(1);
    setOvertimeHours(1);
  };

  const options: { id: LogType; label: string; color: string; isCustom?: boolean; customId?: string }[] = [
    { id: 'ordinaria', label: 'Licenza Ordinaria', color: 'bg-blue-600' },
    { id: 'legge937', label: 'Legge 937', color: 'bg-yellow-600' },
    { id: 'malattia', label: 'Malattia', color: 'bg-red-600' },
    { id: 'straordinario', label: 'Straordinario', color: 'bg-indigo-600' },
    { id: 'guardia', label: 'Guardia', color: 'bg-purple-600' },
    { id: 'recupero', label: 'Recupero', color: 'bg-emerald-600' },
    { id: 'permesso', label: 'Permesso Orario', color: 'bg-orange-600' },
    ...state.customFields.map(f => ({ id: 'custom' as LogType, customId: f.id, label: f.name, color: 'bg-slate-600', isCustom: true })),
    { id: 'rettifica', label: 'Rettifica / Manuale', color: 'bg-pink-600' },
  ];

  const balanceOptions = [
      { id: 'ordinaria', label: 'Licenza Ordinaria', unit: 'giorni' },
      { id: 'legge937', label: 'Legge 937', unit: 'giorni' },
      { id: 'malattia', label: 'Malattia', unit: 'giorni' },
      { id: 'recuperoRiposo', label: 'Recupero Riposo', unit: 'giorni' },
      { id: 'hoursBank', label: 'Banca Ore', unit: 'ore' },
      { id: 'moneyBank', label: 'Compensi', unit: '€' },
      ...state.customFields.map(f => ({ id: f.id, label: f.name, unit: f.unit }))
  ];

  const currentBalanceUnit = balanceOptions.find(b => b.id === rettificaTarget)?.unit || '';

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg animate-slide-up pb-24 lg:pb-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Save className="text-gold-500" />
        Registra Attività
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
           {options.map((opt, idx) => (
               <button
                key={opt.isCustom ? `custom-${opt.customId}` : opt.id}
                type="button"
                onClick={() => {
                    setType(opt.id);
                    if (opt.isCustom && opt.customId) setCustomFieldId(opt.customId);
                }}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent 
                  ${(type === opt.id && (!opt.isCustom || customFieldId === opt.customId))
                    ? `${opt.color} text-white border-white/20 shadow-lg scale-[1.02]` 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
               >
                 {opt.label}
               </button>
           ))}
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-sm font-medium">Data Evento</label>
          <div className="relative">
             <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18}/>
             <input 
               type="date" 
               required
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
             />
          </div>
        </div>

        {type === 'rettifica' && (
            <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600 space-y-4">
                <div className="flex items-center gap-2 text-pink-400 mb-2">
                    <Edit size={20} />
                    <span className="font-bold">Modifica Manuale Saldi</span>
                </div>
                
                <div className="space-y-2">
                    <label className="text-slate-400 text-sm">Saldo da modificare</label>
                    <select 
                        value={rettificaTarget}
                        onChange={(e) => setRettificaTarget(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                        {balanceOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label} ({opt.unit})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-slate-400 text-sm">Operazione</label>
                        <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-600">
                            <button 
                                type="button"
                                onClick={() => setRettificaOp('add')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${rettificaOp === 'add' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Plus size={16}/> Aggiungi
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRettificaOp('subtract')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${rettificaOp === 'subtract' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Minus size={16}/> Rimuovi
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-slate-400 text-sm">Quantità ({currentBalanceUnit})</label>
                        <input 
                            type="number"
                            step="0.01"
                            required
                            value={rettificaQty}
                            onChange={(e) => setRettificaQty(parseFloat(e.target.value))}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-pink-500 outline-none font-mono"
                        />
                    </div>
                </div>
            </div>
        )}

        {type === 'straordinario' && (
          <div className="space-y-2">
             <label className="text-slate-400 text-sm">Ore Straordinario</label>
             <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18}/>
                <input 
                  type="number" step="0.5" min="0.1" required
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(parseFloat(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
          </div>
        )}

        {type === 'permesso' && (
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-slate-400 text-sm">Ora Inizio</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                />
             </div>
             <div className="space-y-2">
                <label className="text-slate-400 text-sm">Ora Fine</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                />
             </div>
          </div>
        )}

        <div className="space-y-2">
            <label className="text-slate-400 text-sm font-medium">Note (Opzionale)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dettagli aggiuntivi..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none min-h-[80px]"
            />
        </div>

        {type !== 'rettifica' && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 flex items-start gap-3">
                <AlertCircle className="text-gold-500 mt-1 flex-shrink-0" size={20} />
                <div className="text-sm text-slate-300">
                    <p className="font-semibold text-white mb-1">Riepilogo Normativa:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {type === 'straordinario' && (
                            <>
                              <li>Accredito: <strong>+{calculatedInfo?.hours} ore</strong> in banca ore (1:1).</li>
                              {calculatedInfo?.isSunday ? (
                                <li className="text-emerald-400 font-bold flex items-center gap-1">
                                  <Coffee size={14}/> Ripresa Riposo: +1 giorno Recupero Riposo!
                                </li>
                              ) : (
                                <li className="text-slate-400 italic">Sabato/Feriale: nessun recupero giornata extra.</li>
                              )}
                            </>
                        )}
                        {type === 'guardia' && <li>Accredito: <strong>+{calculatedInfo?.hours} ore</strong> in banca ore.</li>}
                        {type === 'guardia' && <li>Compenso: <strong>+€ {calculatedInfo?.money}</strong> (CFG).</li>}
                        {type === 'recupero' && <li>Addebito: <strong>{calculatedInfo?.hours} ore</strong>.</li>}
                        {type === 'permesso' && <li>Permesso di <strong>{calculatedInfo?.hours.toFixed(2)} ore</strong>.</li>}
                        {type === 'ordinaria' && <li>Scalata 1 giornata di Licenza Ordinaria.</li>}
                        {type === 'legge937' && <li>Scalata 1 giornata di Legge 937.</li>}
                    </ul>
                </div>
            </div>
        )}

        <button 
          type="submit"
          className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 ${
            type === 'rettifica' 
             ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/20'
             : 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-900 shadow-gold-500/20'
          }`}
        >
          {type === 'rettifica' ? 'Applica Modifica' : 'Registra Evento'}
        </button>

      </form>
    </div>
  );
};

export default ActionPanel;
