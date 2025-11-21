
import React, { useState, useEffect } from 'react';
import { AppState, INITIAL_STATE, LogEntry, CustomField } from './types';
import Dashboard from './components/Dashboard';
import ActionPanel from './components/ActionPanel';
import History from './components/History';
import Settings from './components/Settings';
import Assistant from './components/Assistant';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, Settings as SettingsIcon, MessageSquare, Anchor } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'action' | 'history' | 'settings' | 'assistant'>('dashboard');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('marinaLogState');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('marinaLogState', JSON.stringify(state));
  }, [state]);

  const handleAddEntry = (newEntryData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const entry: LogEntry = {
      ...newEntryData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setState(prev => {
      const newBalances = { ...prev.balances };

      // Logic to update balances based on entry type
      switch (entry.type) {
        case 'ordinaria':
          newBalances.ordinaria -= entry.quantity;
          break;
        case 'legge937':
          newBalances.legge937 -= entry.quantity;
          break;
        case 'malattia':
          newBalances.malattia -= entry.quantity;
          break;
        case 'guardia':
          newBalances.hoursBank += entry.quantity; // Add hours
          newBalances.moneyBank += entry.moneyAccrued; // Add money
          break;
        case 'recupero':
          newBalances.hoursBank -= entry.quantity; // Subtract hours
          break;
        case 'permesso':
          newBalances.hoursBank -= entry.quantity; // Subtract hours
          break;
        case 'rettifica':
           if (entry.targetBalance) {
               // Add quantity directly (can be negative if subtraction was selected)
               const current = newBalances[entry.targetBalance] || 0;
               newBalances[entry.targetBalance] = current + entry.quantity;
           }
           break;
        case 'custom':
          if (entry.customFieldId) {
             const field = prev.customFields.find(f => f.id === entry.customFieldId);
             if (field) {
                 if (field.balanceEffect === 'subtract') {
                     newBalances[field.id] = (newBalances[field.id] || field.initialBalance || 0) - entry.quantity;
                 } else if (field.balanceEffect === 'add') {
                     newBalances[field.id] = (newBalances[field.id] || field.initialBalance || 0) + entry.quantity;
                 }
             }
          }
          break;
      }

      return {
        ...prev,
        balances: newBalances,
        history: [entry, ...prev.history],
      };
    });

    setActiveTab('dashboard');
  };

  const handleDeleteEntry = (id: string) => {
    const entry = state.history.find(e => e.id === id);
    if (!entry) return;

    setState(prev => {
      const newBalances = { ...prev.balances };

      // Reverse the logic
      switch (entry.type) {
        case 'ordinaria':
          newBalances.ordinaria += entry.quantity;
          break;
        case 'legge937':
          newBalances.legge937 += entry.quantity;
          break;
        case 'malattia':
          newBalances.malattia += entry.quantity;
          break;
        case 'guardia':
          newBalances.hoursBank -= entry.quantity;
          newBalances.moneyBank -= entry.moneyAccrued;
          break;
        case 'recupero':
          newBalances.hoursBank += entry.quantity;
          break;
        case 'permesso':
          newBalances.hoursBank += entry.quantity;
          break;
        case 'rettifica':
           if (entry.targetBalance) {
               // Reverse the operation
               const current = newBalances[entry.targetBalance] || 0;
               newBalances[entry.targetBalance] = current - entry.quantity;
           }
           break;
        case 'custom':
           if (entry.customFieldId) {
             const field = prev.customFields.find(f => f.id === entry.customFieldId);
             if (field) {
                 if (field.balanceEffect === 'subtract') {
                     newBalances[field.id] = (newBalances[field.id] || 0) + entry.quantity;
                 } else if (field.balanceEffect === 'add') {
                     newBalances[field.id] = (newBalances[field.id] || 0) - entry.quantity;
                 }
             }
          }
          break;
      }

      return {
        ...prev,
        balances: newBalances,
        history: prev.history.filter(e => e.id !== id),
      };
    });
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    localStorage.removeItem('marinaLogState');
  };

  const handleAddCustomField = (field: CustomField) => {
    setState(prev => ({
        ...prev,
        customFields: [...prev.customFields, field],
        balances: {
            ...prev.balances,
            [field.id]: field.initialBalance || 0
        }
    }));
  };

  const handleDeleteCustomField = (id: string) => {
      setState(prev => {
          const newBalances = {...prev.balances};
          delete newBalances[id];
          return {
              ...prev,
              customFields: prev.customFields.filter(f => f.id !== id),
              balances: newBalances
          };
      });
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-200 font-sans selection:bg-gold-500 selection:text-navy-900 flex flex-col lg:flex-row overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen p-6 fixed z-20">
        <div className="flex items-center gap-3 mb-10 text-white">
            <div className="p-2 bg-gold-500 rounded-lg text-navy-900 shadow-lg shadow-gold-500/30">
                <Anchor size={28} />
            </div>
            <div>
                <h1 className="font-bold text-xl tracking-tight font-display">MARINA<span className="text-gold-500">LOG</span></h1>
                <p className="text-xs text-slate-500">Gestione Personale</p>
            </div>
        </div>
        
        <nav className="space-y-2 flex-1">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<PlusCircle size={20} />} label="Nuova Attività" active={activeTab === 'action'} onClick={() => setActiveTab('action')} />
            <SidebarItem icon={<HistoryIcon size={20} />} label="Storico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <SidebarItem icon={<MessageSquare size={20} />} label="Consigliere" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
            <SidebarItem icon={<SettingsIcon size={20} />} label="Impostazioni" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
                <img src={state.user.avatarUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-gold-500" />
                <div>
                    <p className="text-sm font-bold text-white">{state.user.name}</p>
                    <p className="text-xs text-slate-500">{state.user.rank}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Mobile/Tablet Header */}
      <header className="lg:hidden bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-30 flex justify-between items-center">
         <div className="flex items-center gap-2 text-white">
            <Anchor className="text-gold-500" size={24} />
            <h1 className="font-bold text-lg font-display">MARINA<span className="text-gold-500">LOG</span></h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard state={state} />}
            {activeTab === 'action' && <ActionPanel state={state} onAddEntry={handleAddEntry} />}
            {activeTab === 'history' && <History state={state} onDelete={handleDeleteEntry} />}
            {activeTab === 'settings' && <Settings state={state} onReset={handleReset} onAddCustomField={handleAddCustomField} onDeleteCustomField={handleDeleteCustomField} />}
            {activeTab === 'assistant' && <Assistant state={state} />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-2 flex justify-around z-40 pb-safe">
          <MobileNavItem icon={<LayoutDashboard size={20} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MobileNavItem icon={<PlusCircle size={20} />} label="Nuovo" active={activeTab === 'action'} onClick={() => setActiveTab('action')} />
          <MobileNavItem icon={<HistoryIcon size={20} />} label="Storico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <MobileNavItem icon={<MessageSquare size={20} />} label="AI" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
          <MobileNavItem icon={<SettingsIcon size={20} />} label="Opzioni" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            active 
            ? 'bg-gold-500 text-navy-900 font-bold shadow-lg shadow-gold-500/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full py-2 rounded-lg transition-colors ${
            active ? 'text-gold-500' : 'text-slate-500'
        }`}
    >
        {icon}
        <span className="text-[10px] mt-1">{label}</span>
    </button>
);

export default App;
