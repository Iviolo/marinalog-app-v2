
import React, { useState, useMemo } from 'react';
import { AppState, WorkLogEntry } from '../types';
import { Wrench, Anchor, Trash2, Filter, Calendar, Clock, Ship, PenTool, Plus, Search, Save, X, Edit2 } from 'lucide-react';

interface WorkLogProps {
  state: AppState;
  onAddLog: (entry: Omit<WorkLogEntry, 'id' | 'timestamp'>) => void;
  onUpdateLog: (entry: WorkLogEntry) => void;
  onDeleteLog: (id: string) => void;
}

const WorkLog: React.FC<WorkLogProps> = ({ state, onAddLog, onUpdateLog, onDeleteLog }) => {
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [boatName, setBoatName] = useState('');
  const [workType, setWorkType] = useState<WorkLogEntry['workType']>('Manutenzione');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(0);
  const [notes, setNotes] = useState('');

  // Filter State
  const [filterBoat, setFilterBoat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const workTypes = ['Manutenzione', 'Pulizia', 'Riparazione', 'Ispezione', 'Altro'];

  const resetForm = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setBoatName('');
    setWorkType('Manutenzione');
    setDescription('');
    setHours(0);
    setNotes('');
  };

  const handleEditClick = (log: WorkLogEntry) => {
    setEditingId(log.id);
    setDate(log.date);
    setBoatName(log.boatName);
    setWorkType(log.workType);
    setDescription(log.description);
    setHours(log.hours);
    setNotes(log.notes || '');
    
    // Scroll to form top logic could go here
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!boatName || !description || !date) {
        alert("Compila tutti i campi obbligatori.");
        return;
    }

    if (editingId) {
        // Update existing log
        onUpdateLog({
            id: editingId,
            date,
            boatName,
            workType,
            description,
            hours,
            notes,
            timestamp: Date.now() // Update timestamp to show modification time if needed
        });
    } else {
        // Add new log
        onAddLog({
            date,
            boatName,
            workType,
            description,
            hours,
            notes
        });
    }

    // Soft reset: keep date and boat name if adding multiple, but full reset if editing finished
    if (editingId) {
        resetForm();
    } else {
        setDescription('');
        setNotes('');
        setHours(0);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare definitivamente questo report di lavoro?")) {
        onDeleteLog(id);
        if (editingId === id) resetForm();
    }
  };

  const filteredLogs = useMemo(() => {
    return (state.workLogs || []).filter(log => {
      const matchesBoat = filterBoat === '' || log.boatName.toLowerCase().includes(filterBoat.toLowerCase());
      const matchesType = filterType === '' || log.workType === filterType;
      const matchesDateStart = filterDateStart === '' || log.date >= filterDateStart;
      const matchesDateEnd = filterDateEnd === '' || log.date <= filterDateEnd;
      return matchesBoat && matchesType && matchesDateStart && matchesDateEnd;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [state.workLogs, filterBoat, filterType, filterDateStart, filterDateEnd]);

  return (
    <div className="space-y-6 pb-24 lg:pb-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3 text-white mb-2">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
          <Wrench size={24} className="text-white" />
        </div>
        <div>
           <h2 className="text-2xl font-bold font-display">Giornale dei Lavori</h2>
           <p className="text-slate-400 text-sm">Tracciamento manutenzioni e interventi navali</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${editingId ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-700'}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${editingId ? 'text-emerald-400' : 'text-white'}`}>
                  {editingId ? <Edit2 size={20}/> : <Plus className="text-gold-500" size={20}/>}
                  {editingId ? 'Modifica Lavoro' : 'Nuovo Lavoro'}
                </h3>
                {editingId && (
                    <button type="button" onClick={resetForm} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded flex items-center gap-1">
                        <X size={12}/> Annulla
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Data</label>
                <input 
                  type="date" required value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Nome Barca / Mezzo</label>
                <div className="relative">
                   <Ship className="absolute left-3 top-3 text-slate-500" size={16}/>
                   <input 
                     type="text" required value={boatName} onChange={e => setBoatName(e.target.value)}
                     placeholder="Es. Nave Vespucci"
                     className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                   />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Tipo Intervento</label>
                <select 
                   required value={workType} onChange={e => setWorkType(e.target.value as any)}
                   className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                >
                   {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Descrizione Lavoro</label>
                <textarea 
                  required value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Dettagli intervento..."
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Ore Impiegate</label>
                    <input 
                      type="number" step="0.5" min="0" required value={hours} onChange={e => setHours(parseFloat(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                 </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Note</label>
                    <input 
                      type="text" value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Opzionale"
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                 </div>
              </div>

              <button 
                type="submit"
                className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95 mt-2 flex items-center justify-center gap-2 ${
                    editingId 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-gold-500 hover:bg-gold-600 text-navy-900 shadow-gold-500/20'
                }`}
              >
                {editingId ? <><Save size={18}/> Salva Modifiche</> : <><Plus size={18}/> Aggiungi Lavoro</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List & Filters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 text-gold-500 font-bold min-w-[80px]">
               <Filter size={20}/> Filtri:
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
               <input 
                 type="text" placeholder="Cerca barca..." value={filterBoat} onChange={e => setFilterBoat(e.target.value)}
                 className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500 outline-none"
               />
               <select 
                 value={filterType} onChange={e => setFilterType(e.target.value)}
                 className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500 outline-none"
               >
                 <option value="">Tutti i tipi</option>
                 {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
               <div className="flex gap-2">
                 <input 
                   type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)}
                   className="w-1/2 bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:border-gold-500 outline-none"
                 />
                  <input 
                   type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)}
                   className="w-1/2 bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:border-gold-500 outline-none"
                 />
               </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pl-4 space-y-6">
             {/* Vertical Line */}
             <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700/50"></div>

             {filteredLogs.length === 0 ? (
               <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700 text-center text-slate-500">
                  <Search size={48} className="mx-auto mb-4 opacity-20"/>
                  Nessun lavoro trovato con i filtri attuali.
               </div>
             ) : (
               filteredLogs.map((log) => (
                 <div key={log.id} className="relative pl-8 group">
                    {/* Dot */}
                    <div className={`absolute left-[10px] top-6 w-4 h-4 rounded-full border-4 border-slate-900 shadow-lg z-10 transition-transform group-hover:scale-125 ${
                        log.id === editingId ? 'bg-emerald-500 animate-pulse' : 'bg-gold-500'
                    }`}></div>
                    
                    {/* Card */}
                    <div className={`wave-card bg-slate-800/80 backdrop-blur p-5 rounded-xl border shadow-lg hover:border-blue-500/50 transition-all ${
                        log.id === editingId ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-slate-700'
                    }`}>
                       <div className="flex justify-between items-start mb-3 relative z-20">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${
                               log.workType === 'Manutenzione' ? 'bg-blue-500/20 text-blue-400' :
                               log.workType === 'Riparazione' ? 'bg-red-500/20 text-red-400' :
                               log.workType === 'Pulizia' ? 'bg-cyan-500/20 text-cyan-400' :
                               'bg-slate-500/20 text-slate-400'
                             }`}>
                                <Anchor size={20} />
                             </div>
                             <div>
                                <h4 className="font-bold text-white text-lg">{log.boatName}</h4>
                                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                  <Calendar size={12}/> {log.date}
                                </span>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               type="button"
                               onClick={(e) => { e.stopPropagation(); handleEditClick(log); }}
                               className="text-slate-400 hover:text-emerald-400 p-2 rounded-full hover:bg-slate-700/50 transition-colors cursor-pointer"
                               title="Modifica"
                             >
                                <Edit2 size={18} />
                             </button>
                             <button 
                               type="button"
                               onClick={(e) => { e.stopPropagation(); handleDeleteClick(log.id); }}
                               className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-700/50 transition-colors cursor-pointer"
                               title="Elimina"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </div>

                       <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 mb-3 relative z-10">
                          <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                             <span>{log.workType}</span>
                             <span className="flex items-center gap-1 text-gold-500"><Clock size={12}/> {log.hours}h</span>
                          </div>
                          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{log.description}</p>
                       </div>

                       {log.notes && (
                         <div className="flex items-start gap-2 text-xs text-slate-400 italic bg-slate-800/50 p-2 rounded border border-slate-700/30 relative z-10">
                            <PenTool size={12} className="mt-0.5"/>
                            {log.notes}
                         </div>
                       )}
                    </div>
                 </div>
               ))
             )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default WorkLog;
