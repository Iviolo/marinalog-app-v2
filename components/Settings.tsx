import React, { useState } from 'react';
import { AppState, CustomField } from '../types';
import { Plus, RefreshCw, Trash, Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  onReset: () => void;
  onAddCustomField: (field: CustomField) => void;
  onDeleteCustomField: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onReset, onAddCustomField, onDeleteCustomField }) => {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState<'giorni'|'ore'>('giorni');
  const [newFieldEffect, setNewFieldEffect] = useState<'add'|'subtract'|'none'>('subtract');
  const [newFieldInitial, setNewFieldInitial] = useState(0);

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `custom_${Date.now()}`;
    onAddCustomField({
        id,
        name: newFieldName,
        unit: newFieldUnit,
        balanceEffect: newFieldEffect,
        initialBalance: newFieldInitial,
        color: '#10b981' // Default emerald
    });
    setNewFieldName('');
    setNewFieldInitial(0);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg space-y-8 pb-24 lg:pb-6">
      
      {/* Reset Section */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <SettingsIcon size={20} />
            Gestione Dati
        </h3>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
                <h4 className="text-red-400 font-semibold">Reset Totale</h4>
                <p className="text-red-400/70 text-sm">Cancella tutti i dati e ripristina i valori iniziali.</p>
            </div>
            <button 
                onClick={() => {
                    if(window.confirm("Sei sicuro di voler resettare tutto?")) onReset();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
                <RefreshCw size={16} /> Reset
            </button>
        </div>
      </div>

      {/* Custom Fields Section */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Campi Personalizzati</h3>
        <form onSubmit={handleAddField} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">Nome</label>
                    <input 
                        type="text" required 
                        value={newFieldName} 
                        onChange={e => setNewFieldName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                        placeholder="Es. Licenza Studio"
                    />
                </div>
                 <div>
                    <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">Plafond Iniziale</label>
                    <input 
                        type="number" required 
                        value={newFieldInitial} 
                        onChange={e => setNewFieldInitial(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">Unità</label>
                    <select 
                        value={newFieldUnit} 
                        onChange={(e: any) => setNewFieldUnit(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                    >
                        <option value="giorni">Giorni</option>
                        <option value="ore">Ore</option>
                    </select>
                </div>
                 <div>
                    <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">Effetto su Saldo</label>
                    <select 
                        value={newFieldEffect} 
                        onChange={(e: any) => setNewFieldEffect(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                    >
                        <option value="subtract">Sottrai (Consumo)</option>
                        <option value="add">Aggiungi (Accumulo)</option>
                        <option value="none">Nessuno (Solo tracciamento)</option>
                    </select>
                </div>
            </div>
            <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Aggiungi Campo
            </button>
        </form>

        {/* List Custom Fields */}
        <div className="mt-4 space-y-2">
            {state.customFields.map(field => (
                <div key={field.id} className="flex items-center justify-between bg-slate-900/30 p-3 rounded-lg border border-slate-700">
                    <div>
                        <span className="font-medium text-white">{field.name}</span>
                        <span className="text-slate-500 text-sm ml-2">({field.unit})</span>
                    </div>
                    <button 
                        onClick={() => onDeleteCustomField(field.id)}
                        className="text-slate-500 hover:text-red-500 transition-colors"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;