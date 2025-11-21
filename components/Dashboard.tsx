import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AppState } from '../types';
import { Shield, Clock, Banknote, HeartPulse, Calendar, Award } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  
  const dataPie = [
    { name: 'Ordinaria', value: state.balances.ordinaria, color: '#3b82f6' }, // blue-500
    { name: 'L. 937', value: state.balances.legge937, color: '#eab308' }, // yellow-500
    { name: 'Malattia', value: state.balances.malattia, color: '#ef4444' }, // red-500
  ];

  const historyChartData = state.history.slice(0, 7).map(entry => ({
    date: entry.date.substring(5), // MM-DD
    valore: entry.quantity,
    type: entry.type
  })).reverse();

  return (
style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1200&auto=format&fit=crop"), url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 1200 800%27%3E%3Cdefs%3E%3ClinearGradient id=%27grad%27 x1=%270%25%27 y1=%270%25%27 x2=%270%25%27 y2=%27100%25%27%3E%3Cstop offset=%270%25%27 style=%27stop-color:rgba(0,51,102,0.7);stop-opacity:1%27 /%3E%3Cstop offset=%27100%25%27 style=%27stop-color:rgba(0,102,153,0.5);stop-opacity:1%27 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%271200%27 height=%27800%27 fill=%27url(%23grad)%27/%3E%3C/svg%3E")', backgroundAttachment: 'fixed', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', opacity: 0.95 }} space-y-6 animate-fade-in pb-20 lg:pb-0 bg-cover bg-center bg-attachment-fixed min-h-screen      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={64} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Award size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Licenza Ordinaria</h3>
          </div>
          <div className="text-3xl font-bold text-white">{state.balances.ordinaria} <span className="text-sm text-slate-500 font-normal">giorni</span></div>
          <div className="mt-2 text-xs text-slate-400">Su 39 giorni totali</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield size={64} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
              <Shield size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Legge 937</h3>
          </div>
          <div className="text-3xl font-bold text-white">{state.balances.legge937} <span className="text-sm text-slate-500 font-normal">giorni</span></div>
          <div className="mt-2 text-xs text-slate-400">Su 4 giorni totali</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={64} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Clock size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Banca Ore</h3>
          </div>
          <div className="text-3xl font-bold text-white">{state.balances.hoursBank} <span className="text-sm text-slate-500 font-normal">h</span></div>
          <div className="mt-2 text-xs text-slate-400">Accumulo recuperi e guardie</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Banknote size={64} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Banknote size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Compensi C.F.G.</h3>
          </div>
          <div className="text-3xl font-bold text-white">€ {state.balances.moneyBank}</div>
          <div className="mt-2 text-xs text-slate-400">Maturati dalle guardie</div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart */}
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

        {/* Activity Bar Chart */}
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

      {/* Custom Fields Summary */}
      {state.customFields.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Categorie Personalizzate</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {state.customFields.map(field => (
              <div key={field.id} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                <div className="text-sm text-slate-400">{field.name}</div>
                <div className="text-xl font-bold" style={{ color: field.color }}>
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
