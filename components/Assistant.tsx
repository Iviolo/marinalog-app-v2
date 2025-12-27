
import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { askMilitaryAdvisor } from '../services/geminiService';
import { Send, Loader2, User, Bot } from 'lucide-react';

interface AssistantProps {
  state: AppState;
}

const Assistant: React.FC<AssistantProps> = ({ state }) => {
  // State for Chat
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Comandi! Sono l\'assistente virtuale per la logistica. Posso darti informazioni sui tuoi saldi, calcolare le ore di recupero o chiarire dubbi sui turni di guardia.' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Fix: Passed missing 'state' argument to askMilitaryAdvisor and removed the explicit apiKey argument
      // to rely on the SDK internal use of process.env.API_KEY as per guidelines.
      // Also fixed the syntax errors (stray braces and catch block alignment).
      const response = await askMilitaryAdvisor(userMsg, state);
      setLoading(false);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setLoading(false);
      const errorMsg = (error instanceof Error ? error.message : 'Errore API sconosciuto');
      setMessages(prev => [...prev, { role: 'ai', text: 'Errore: ' + errorMsg }]);
    }
  };

  // --- RENDER: CHAT INTERFACE ---
  // Note: API key management UI has been removed as it is prohibited by coding guidelines.
  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg flex flex-col h-[600px] overflow-hidden animate-fade-in mb-20 lg:mb-0">
      
      {/* Header */}
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500/20 rounded-full text-gold-500 relative">
                <Bot size={24} />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
                <h3 className="font-bold text-white leading-tight">Consigliere Navale</h3>
                <p className="text-xs text-emerald-400">Online • Gemini 3 Flash</p>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/20 scroll-smooth">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
                }`}>
                    <div className="flex items-center gap-2 mb-2 opacity-60 text-[10px] uppercase font-bold tracking-wider">
                        {msg.role === 'user' ? <User size={10}/> : <Bot size={10}/>}
                        {msg.role === 'user' ? 'Tu' : 'Assistente'}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm markdown-body">
                        {msg.text}
                    </div>
                </div>
            </div>
        ))}
        {loading && (
            <div className="flex justify-start animate-pulse">
                <div className="bg-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-3 border border-slate-600">
                    <Loader2 className="animate-spin text-gold-500" size={18} />
                    <span className="text-slate-300 text-sm">Analisi dati in corso...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chiedi informazioni sui saldi o regolamenti..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none placeholder:text-slate-500"
            disabled={loading}
        />
        <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:hover:bg-gold-500 text-navy-900 p-3 rounded-xl transition-all font-bold shadow-lg shadow-gold-500/10"
        >
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Assistant;
