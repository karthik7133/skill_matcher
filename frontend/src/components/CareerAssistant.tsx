import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const CareerAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        setMessage('');
        setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);
        console.log('[CareerAssistant] Sending message to /chat/assistant...');

        // Safety timeout: force-clear loading after 30s to prevent stuck state
        const timeout = setTimeout(() => {
            console.warn('[CareerAssistant] Timeout! Clearing loading state.');
            setLoading(false);
            setHistory(prev => [...prev, { role: 'assistant', content: '⏱️ Request timed out. Please try again.' }]);
        }, 30000);

        try {
            console.log('[CareerAssistant] API base URL:', apiClient.defaults.baseURL);
            const res = await apiClient.post('/chat/assistant', {
                message: userMessage,
                history: history.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    content: m.content
                }))
            });
            console.log('[CareerAssistant] Response received:', res.status, res.data?.message?.slice(0, 80));
            setHistory(prev => [...prev, { role: 'assistant', content: res.data.message }]);
        } catch (err: any) {
            console.error('[CareerAssistant] FULL ERROR:', err?.response?.status, err?.response?.data, err?.message);
            const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error';
            setHistory(prev => [...prev, { role: 'assistant', content: `❌ Error: ${errorMsg}` }]);
        } finally {
            clearTimeout(timeout);
            setLoading(false);
            console.log('[CareerAssistant] Done. Loading cleared.');
        }
    };

    return (
        <>
            {/* FAB Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center z-[100] border border-white/20"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="fixed bottom-24 right-8 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] glass-dark border border-white/10 rounded-3xl shadow-2xl z-[100] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Career AI Advisor</h3>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Always Online</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {history.length === 0 && (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Bot size={24} className="text-slate-500" />
                                    </div>
                                    <p className="text-sm text-slate-400">Hello! I'm your Career AI Advisor. Ask me anything about your matches, resume, or skills!</p>
                                </div>
                            )}

                            {history.map((m, idx) => (
                                <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-primary-500' : 'bg-slate-800'}`}>
                                        {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-primary-500/20 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none">
                                        <Loader2 size={16} className="animate-spin text-primary-500" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer / Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your query..."
                                className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-primary-600"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CareerAssistant;
