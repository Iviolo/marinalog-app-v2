
import React, { useState, useEffect } from 'react';
import { AppState, INITIAL_STATE, LogEntry, CustomField, WorkLogEntry } from './types';
import Dashboard from './components/Dashboard';
import ActionPanel from './components/ActionPanel';
import History from './components/History';
import Settings from './components/Settings';
import Assistant from './components/Assistant';
import WorkLog from './components/WorkLog';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, Settings as SettingsIcon, MessageSquare, Anchor, Wrench, Bot } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'action' | 'history' | 'settings' | 'assistant' | 'worklog'>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('marinaLogState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({
            ...INITIAL_STATE,
            ...parsed,
            balances: { 
              ...INITIAL_STATE.balances, 
              ...parsed.balances,
              // Migration for renaming
              recuperoRiposo: parsed.balances?.recuperoRiposo ?? parsed.balances?.festiviRecupero ?? 0
            },
            workLogs: Array.isArray(parsed.workLogs) ? parsed.workLogs : [],
            user: INITIAL_STATE.user
        }));
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

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
      const dayOfWeek = new Date(entry.date).getDay();
      const isSunday = dayOfWeek === 0;

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
          newBalances.hoursBank += entry.quantity;
          newBalances.moneyBank += entry.moneyAccrued;
          break;
        case 'straordinario':
          newBalances.hoursBank += entry.quantity;
          // NORMATIVA: Solo di domenica/festivo si recupera la giornata di riposo (1gg)
          if (isSunday) {
            newBalances.recuperoRiposo += 1;
            entry.isWeekendBonus = true;
          }
          break;
        case 'recupero':
          newBalances.hoursBank -= entry.quantity;
          break;
        case 'permesso':
          newBalances.hoursBank -= entry.quantity;
          break;
        case 'rettifica':
           if (entry.targetBalance) {
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
        case 'straordinario':
          newBalances.hoursBank -= entry.quantity;
          if (entry.isWeekendBonus) {
            newBalances.recuperoRiposo -= 1;
          }
          break;
        case 'recupero':
          newBalances.hoursBank += entry.quantity;
          break;
        case 'permesso':
          newBalances.hoursBank += entry.quantity;
          break;
        case 'rettifica':
           if (entry.targetBalance) {
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

  const handleAddWorkLog = (newLog: Omit<WorkLogEntry, 'id' | 'timestamp'>) => {
      const entry: WorkLogEntry = {
          ...newLog,
          id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
      };
      setState(prev => ({
          ...prev,
          workLogs: [entry, ...(prev.workLogs || [])]
      }));
  };

  const handleUpdateWorkLog = (updatedLog: WorkLogEntry) => {
      setState(prev => ({
          ...prev,
          workLogs: (prev.workLogs || []).map(log => log.id === updatedLog.id ? updatedLog : log)
      }));
  };

  const handleDeleteWorkLog = (id: string) => {
      setState(prev => ({
          ...prev,
          workLogs: (prev.workLogs || []).filter(log => log.id !== id)
      }));
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-200 font-sans selection:bg-gold-500 selection:text-navy-900 flex flex-col lg:flex-row overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=2073&auto=format&fit=crop" 
            alt="Ocean Background" 
            className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900/90 to-slate-900/80"></div>
      </div>

      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 h-screen p-6 fixed z-20 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 text-white">
            <div className="p-2 bg-gold-500 rounded-lg text-navy-900 shadow-lg shadow-gold-500/30">
                <Anchor size={28} />
            </div>
            <div>
                <h1 className="font-bold text-xl tracking-tight font-display">MARINA<span className="text-gold-500">LOG</span></h1>
                <p className="text-xs text-slate-400">Gestione Personale</p>
            </div>
        </div>
        
        <nav className="space-y-2 flex-1">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<PlusCircle size={20} />} label="Nuova Attività" active={activeTab === 'action'} onClick={() => setActiveTab('action')} />
            <SidebarItem icon={<Wrench size={20} />} label="Giornale Lavori" active={activeTab === 'worklog'} onClick={() => setActiveTab('worklog')} />
            <SidebarItem icon={<HistoryIcon size={20} />} label="Storico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <SidebarItem icon={<MessageSquare size={20} />} label="Consigliere" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
            <SidebarItem icon={<SettingsIcon size={20} />} label="Impostazioni" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-3">
                <img src={state.user.avatarUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-gold-500" />
                <div>
                    <p className="text-sm font-bold text-white">{state.user.name}</p>
                    <p className="text-xs text-slate-400">{state.user.rank}</p>
                </div>
            </div>
        </div>
      </aside>

      <header className="lg:hidden bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 p-4 sticky top-0 z-30 flex justify-between items-center shadow-lg">
         <div className="flex items-center gap-2 text-white">
            <Anchor className="text-gold-500" size={24} />
            <h1 className="font-bold text-lg font-display">MARINA<span className="text-gold-500">LOG</span></h1>
        </div>
      </header>

      <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-y-auto h-screen relative z-10">
        <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard state={state} />}
            {activeTab === 'action' && <ActionPanel state={state} onAddEntry={handleAddEntry} />}
            {activeTab === 'worklog' && <WorkLog state={state} onAddLog={handleAddWorkLog} onUpdateLog={handleUpdateWorkLog} onDeleteLog={handleDeleteWorkLog} />}
            {activeTab === 'history' && <History state={state} onDelete={handleDeleteEntry} />}
            {activeTab === 'settings' && <Settings state={state} onReset={handleReset} onAddCustomField={handleAddCustomField} onDeleteCustomField={handleDeleteCustomField} />}
            {activeTab === 'assistant' && <Assistant state={state} />}
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50 p-2 flex justify-around z-40 pb-safe shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.5)]">
          <MobileNavItem icon={<LayoutDashboard size={20} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MobileNavItem icon={<PlusCircle size={20} />} label="Attività" active={activeTab === 'action'} onClick={() => setActiveTab('action')} />
          <MobileNavItem icon={<Wrench size={20} />} label="Lavori" active={activeTab === 'worklog'} onClick={() => setActiveTab('worklog')} />
          <MobileNavItem icon={<HistoryIcon size={20} />} label="Storico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <MobileNavItem icon={<Bot size={20} />} label="Consigliere" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
          <MobileNavItem icon={<SettingsIcon size={20} />} label="Opzioni" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
            active 
            ? 'bg-gold-500 text-navy-900 font-bold shadow-lg shadow-gold-500/20' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
        <span className="text-[10px] mt-1 text-center leading-none">{label}</span>
    </button>
);

export default App;
