import React, { useState } from 'react';
import { AppState } from '../types';
import { askMilitaryAdvisor } from '../services/geminiService';
import { MessageSquare, Send, Loader2, User, Bot } from 'lucide-react';

interface AssistantProps {
  state: AppState;
}

const Assistant: React.FC<AssistantProps> = ({ state }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Comandi! Sono l\'assistente virtuale per la logistica. Posso darti informazioni sui tuoi saldi, calcolare le ore di recupero o chiarire dubbi sui turni di guardia. Come posso aiutarti?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await askMilitaryAdvisor(userMsg, state);

    setLoading(false);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg flex flex-col h-[600px] overflow-hidden animate-fade-in mb-20 lg:mb-0">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-gold-500/20 rounded-full text-gold-500">
            <Bot size={24} />
        </div>
        <div>
            <h3 className="font-bold text-white">Consigliere Navale</h3>
            <p className="text-xs text-slate-400">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/20">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-100 rounded-bl-none'
                }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50 text-xs uppercase font-bold">
                        {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                        {msg.role === 'user' ? 'Tu' : 'Assistente'}
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-sm">
                        {msg.text}
                    </div>
                </div>
            </div>
        ))}
        {loading && (
            <div className="flex justify-start">
                <div className="bg-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader2 className="animate-spin text-gold-500" size={16} />
                    <span className="text-slate-400 text-sm">Elaborazione risposta...</span>
                </div>
            </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chiedi informazioni sui saldi o regolamenti..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
        />
        <button 
            type="submit"
            disabled={loading}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 p-3 rounded-xl transition-colors font-bold"
        >
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Assistant;