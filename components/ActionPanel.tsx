import React, { useState, useEffect } from 'react';
import { LogType, AppState, LogEntry, CustomField } from '../types';
import { Calendar as CalendarIcon, Clock, Save, AlertCircle } from 'lucide-react';

interface ActionPanelProps {
  state: AppState;
  onAddEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ state, onAddEntry }) => {
  const [type, setType] = useState<LogType>('ordinaria');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [notes, setNotes] = useState<string>('');
  const [customFieldId, setCustomFieldId] = useState<string>('');
  const [calculatedInfo, setCalculatedInfo] = useState<{hours: number, money: number} | null>(null);

  // Helper to calculate effects before submitting
  useEffect(() => {
    const dayOfWeek = new Date(date).getDay(); // 0=Sun, 6=Sat
    let hours = 0;
    let money = 0;

    if (type === 'guardia') {
        // 0 is Sunday, 6 is Saturday.
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend) {
            hours = 24;
            money = 90;
        } else {
            // Mon-Fri (including Friday as regular day for Guardie logic per user prompt "Lun-giov", strictly prompt implies Fri might be different, 
            // but user prompt said: "Lun-giov... Sab/dom". It left Fri undefined for Guardie specific logic.
            // Common sense: Fri is weekday logic unless specified. BUT user said "Lun-giov 8h". 
            // Let's assume Fri acts like Mon-Thu for safety or 8h. 
            hours = 8;
            money = 30;
        }
    } else if (type === 'recupero') {
        if (dayOfWeek === 5) { // Friday
            hours = -4;
        } else if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Mon-Thu
            hours = -8;
        } else {
            hours = 0; // Weekend recovery logic not specified, assume 0 or manual
        }
    } else if (type === 'permesso') {
        const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        hours = Math.max(0, (end - start) / 60);
    }

    setCalculatedInfo({ hours, money });
  }, [type, date, startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let quantity = 0;
    let moneyAccrued = 0;

    // Determine Quantity and Money based on rules
    if (type === 'ordinaria' || type === 'legge937' || type === 'malattia') {
        quantity = 1; // 1 Day
    } else if (type === 'guardia') {
        quantity = calculatedInfo?.hours || 0;
        moneyAccrued = calculatedInfo?.money || 0;
    } else if (type === 'recupero') {
        quantity = Math.abs(calculatedInfo?.hours || 0); // Stored as positive usage of hours bank
    } else if (type === 'permesso') {
        quantity = calculatedInfo?.hours || 0;
    } else if (type === 'custom') {
        quantity = 1; // Default 1 unit, could add input for quantity if unit is hours
    }

    onAddEntry({
        date,
        type,
        quantity,
        moneyAccrued,
        notes,
        startTime: type === 'permesso' ? startTime : undefined,
        endTime: type === 'permesso' ? endTime : undefined,
        customFieldId: type === 'custom' ? customFieldId : undefined
    });

    // Reset specific fields
    setNotes('');
  };

  const options: { id: string; label: string; color: string; isCustom?: boolean; customId?: string }[] = [
    { id: 'ordinaria', label: 'Licenza Ordinaria', color: 'bg-blue-600' },
    { id: 'legge937', label: 'Legge 937', color: 'bg-yellow-600' },
    { id: 'malattia', label: 'Malattia', color: 'bg-red-600' },
    { id: 'guardia', label: 'Guardia', color: 'bg-purple-600' },
    { id: 'recupero', label: 'Recupero', color: 'bg-emerald-600' },
    { id: 'permesso', label: 'Permesso Orario', color: 'bg-orange-600' },
    ...state.customFields.map(f => ({ id: 'custom', customId: f.id, label: f.name, color: 'bg-slate-600', isCustom: true }))
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg animate-slide-up pb-24 lg:pb-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Save className="text-gold-500" />
        Registra Attività
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
           {options.map((opt) => (
               <button
                key={opt.isCustom ? opt.customId : opt.id}
                type="button"
                onClick={() => {
                    setType(opt.id as LogType);
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

        {/* Date Input */}
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

        {/* Conditional Inputs based on Type */}
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

        {/* Notes */}
        <div className="space-y-2">
            <label className="text-slate-400 text-sm font-medium">Note (Opzionale)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dettagli aggiuntivi..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none min-h-[80px]"
            />
        </div>

        {/* Preview Card */}
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 flex items-start gap-3">
            <AlertCircle className="text-gold-500 mt-1 flex-shrink-0" size={20} />
            <div className="text-sm text-slate-300">
                <p className="font-semibold text-white mb-1">Riepilogo Azione:</p>
                <ul className="list-disc list-inside space-y-1">
                    {type === 'guardia' && <li>Accredito: <strong>+{calculatedInfo?.hours} ore</strong> in banca ore.</li>}
                    {type === 'guardia' && <li>Compenso: <strong>+€ {calculatedInfo?.money}</strong>.</li>}
                    {type === 'recupero' && <li>Addebito: <strong>{calculatedInfo?.hours} ore</strong> (giornata lavorativa).</li>}
                    {type === 'permesso' && <li>Permesso di <strong>{calculatedInfo?.hours.toFixed(2)} ore</strong>.</li>}
                    {type === 'ordinaria' && <li>Scalata 1 giornata di Licenza Ordinaria.</li>}
                    {type === 'legge937' && <li>Scalata 1 giornata di Legge 937.</li>}
                    {type === 'malattia' && <li>Scalata 1 giornata dal plafond malattia.</li>}
                </ul>
            </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-900 font-bold py-4 rounded-xl shadow-lg shadow-gold-500/20 transition-all transform active:scale-95"
        >
          Registra Evento
        </button>

      </form>
    </div>
  );
};

export default ActionPanel;