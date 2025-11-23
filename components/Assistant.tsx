import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { askMilitaryAdvisor } from '../services/geminiService';
import { Send, Loader2, User, Bot, Key, Lock, Trash2, CheckCircle } from 'lucide-react';

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

  // State for API Key
  const [apiKey, setApiKey] = useState<string>('');
  const [tempKey, setTempKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);

  // Load Key on Mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySet(true);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSaveKey = () => {
    if (!tempKey.trim()) return;
    localStorage.setItem('gemini_api_key', tempKey);
    setApiKey(tempKey);
    setIsKeySet(true);
    setTempKey('');
  };

  const handleRemoveKey = () => {
    if(window.confirm("Rimuovere la chiave API? L'assistente smetterà di funzionare.")) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      setIsKeySet(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await askMilitaryAdvisor(userMsg, state, apiKey);

    setLoading(false);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
  };

  // --- RENDER: KEY SETUP SCREEN ---
  if (!isKeySet) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg h-[600px] flex flex-col items-center justify-center p-8 animate-fade-in text-center mb-20 lg:mb-0">
        <div className="bg-slate-700/50 p-6 rounded-full mb-6 ring-4 ring-gold-500/20">
            <Lock size={48} className="text-gold-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Attiva il Consigliere</h2>
        <p className="text-slate-400 mb-8 max-w-md">
            Per utilizzare l'intelligenza artificiale, è necessario inserire una API Key di Google Gemini. La chiave verrà salvata esclusivamente sul tuo dispositivo.
        </p>

        <div className="w-full max-w-sm space-y-4">
            <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20}/>
                <input 
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="Incolla qui la tua API Key"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                />
            </div>
            <button 
                onClick={handleSaveKey}
                disabled={!tempKey}
                className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
            >
                <CheckCircle size={20} />
                Salva e Attiva
            </button>
        </div>
        <p className="mt-6 text-xs text-slate-500">
            Non hai una chiave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300">Ottienila qui gratuitamente</a>.
        </p>
      </div>
    );
  }

  // --- RENDER: CHAT INTERFACE ---
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
                <p className="text-xs text-emerald-400">Online • Gemini 2.5 Flash</p>
            </div>
        </div>
        <button 
            onClick={handleRemoveKey}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Rimuovi API Key"
        >
            <Trash2 size={18} />
        </button>
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