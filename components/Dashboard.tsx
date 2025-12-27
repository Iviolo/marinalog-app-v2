
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AppState } from '../types';
import { Shield, Clock, Banknote, Coffee, Calendar, Award, Info } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  
  const dataPie = [
    { name: 'Ordinaria', value: state.balances.ordinaria, color: '#3b82f6' },
    { name: 'L. 937', value: state.balances.legge937, color: '#eab308' },
    { name: 'RRF (Domeniche)', value: state.balances.recuperoRiposo, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card: Licenza */}
        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Award size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Licenza Ordinaria</h3>
            </div>
            <div className="text-3xl font-bold text-white">{state.balances.ordinaria} <span className="text-sm text-slate-400 font-normal">gg</span></div>
            <div className="mt-2 text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Info size={10}/> Residuo anno in corso
            </div>
          </div>
        </div>

        {/* Card: RRF */}
        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                <Coffee size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Recupero Riposo (RRF)</h3>
            </div>
            <div className="text-3xl font-bold text-white">{state.balances.recuperoRiposo} <span className="text-sm text-slate-400 font-normal">gg</span></div>
            <div className="mt-2 text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Calendar size={10}/> Maturato da lavoro domenicale
            </div>
          </div>
        </div>

        {/* Card: Banca Ore */}
        <div className="wave-card bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Clock size={24} />
                </div>
                <h3 className="text-slate-300 font-medium">Banca Ore (1:1)</h3>
            </div>
            <div className="text-3xl font-bold text-white">{state.balances.hoursBank} <span className="text-sm text-slate-400 font-normal">h</span></div>
            <div className="mt-2 text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Shield size={10}/> Straordinari non retribuiti
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            Stato Saldi Giornalieri
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

        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-white mb-4">Promemoria Normativo</h3>
          <div className="space-y-4">
             <div className="p-3 bg-slate-900/50 rounded-xl border-l-4 border-indigo-500">
                <p className="text-sm text-white font-bold">Straordinario Sabato</p>
                <p className="text-xs text-slate-400">Recupero paritario (1:1). Non matura giornata RRF.</p>
             </div>
             <div className="p-3 bg-slate-900/50 rounded-xl border-l-4 border-emerald-500">
                <p className="text-sm text-white font-bold">Straordinario Domenica</p>
                <p className="text-xs text-slate-400">Recupero paritario (1:1) + 1 Giorno di Riposo (RRF).</p>
             </div>
             <div className="p-3 bg-slate-900/50 rounded-xl border-l-4 border-gold-500">
                <p className="text-sm text-white font-bold">Scadenza Recuperi</p>
                <p className="text-xs text-slate-400">Tutti i recuperi maturati quest'anno scadono il 31/12/{(new Date().getFullYear() + 1)}.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
