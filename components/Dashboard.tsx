
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AppState } from '../types';
import { Shield, Clock, Banknote, HeartPulse, Calendar, Award, Coffee } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  
  const dataPie = [
    { name: 'Ordinaria', value: state.balances.ordinaria, color: '#3b82f6' },
    { name: 'L. 937', value: state.balances.legge937, color: '#eab308' },
    { name: 'Malattia', value: state.balances.malattia, color: '#ef4444' },
    { name: 'Recupero Riposo', value: state.balances.recuperoRiposo, color: '#8b5cf6' },
  ];

  const historyChartData = state.history.slice(0, 7).map(entry => ({
    date: entry.date.substring(5), // MM-DD
    valore: entry.quantity,
    type: entry.type
  })).reverse();

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative group cursor-pointer">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
            <Calendar size={64} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Award size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Licenza Ordinaria</h3>
            </div>
            <div className="text-3xl font-bold text-white drop-shadow-sm">{state.balances.ordinaria} <span className="text-sm text-slate-400 font-normal">giorni</span></div>
            <div className="mt-2 text-xs text-slate-400">Su 39 giorni totali</div>
          </div>
        </div>

        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative group cursor-pointer">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
            <Shield size={64} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                <Shield size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Legge 937</h3>
            </div>
            <div className="text-3xl font-bold text-white drop-shadow-sm">{state.balances.legge937} <span className="text-sm text-slate-400 font-normal">giorni</span></div>
            <div className="mt-2 text-xs text-slate-400">Su 4 giorni totali</div>
          </div>
        </div>

        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative group cursor-pointer">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
            <Coffee size={64} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                <Coffee size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Recupero Riposo</h3>
            </div>
            <div className="text-3xl font-bold text-white drop-shadow-sm">{state.balances.recuperoRiposo} <span className="text-sm text-slate-400 font-normal">giorni</span></div>
            <div className="mt-2 text-xs text-slate-400">Maturati da lavoro festivo (1:1)</div>
          </div>
        </div>

        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative group cursor-pointer">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
            <Clock size={64} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Clock size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Banca Ore</h3>
            </div>
            <div className="text-3xl font-bold text-white drop-shadow-sm">{state.balances.hoursBank} <span className="text-sm text-slate-400 font-normal">h</span></div>
            <div className="mt-2 text-xs text-slate-400">Accumulo straordinari/guardie</div>
          </div>
        </div>

        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative group cursor-pointer">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
            <Banknote size={64} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Banknote size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Compensi C.F.G.</h3>
            </div>
            <div className="text-3xl font-bold text-white drop-shadow-sm">€ {state.balances.moneyBank}</div>
            <div className="mt-2 text-xs text-slate-400">Maturati dalle guardie</div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HeartPulse className="text-red-400" size={20}/>
            Stato Saldi
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Attività Recente</h3>
          <div className="h-64 w-full">
            {historyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyChartData}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  <Bar dataKey="valore" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Nessuna attività recente registrata.
              </div>
            )}
          </div>
        </div>
      </div>

      {state.customFields.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Categorie Personalizzate</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {state.customFields.map(field => (
              <div key={field.id} className="wave-card p-4 bg-slate-700/30 rounded-xl border border-slate-600 hover:border-slate-500 cursor-pointer">
                <div className="text-sm text-slate-400 relative z-10">{field.name}</div>
                <div className="text-xl font-bold relative z-10" style={{ color: field.color }}>
                  {state.balances[field.id] || field.initialBalance || 0} <span className="text-xs font-normal">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
