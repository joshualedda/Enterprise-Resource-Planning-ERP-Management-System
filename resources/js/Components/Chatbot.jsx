import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, Bot, ClipboardList, Package, Headphones, Maximize2, Minimize2 } from 'lucide-react';
import axios from 'axios';

// Helper component for rich text formatting
const FormattedMessage = ({ text }) => {
    // Basic markdown-like parser for bold and lists
    const lines = text.split('\n');
    
    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                let content = line;
                
                // Handle bold **text**
                const parts = content.split(/(\*\*.*?\*\*)/g);
                const formattedLine = parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index} className="font-extrabold text-[#0B1F3B]">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });

                // Handle bullet points
                if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                    return (
                        <div key={i} className="flex gap-2 pl-2">
                            <span className="text-[#3BAA35] font-bold">•</span>
                            <span className="flex-1">{formattedLine}</span>
                        </div>
                    );
                }

                return <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{formattedLine}</p>;
            })}
        </div>
    );
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm the SRDI Assistant. How can I help you with your silk acquisitions today?", sender: 'bot', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (text = inputValue) => {
        if (!text.trim()) return;

        const newUserMsg = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Call Gemini API via Backend
        setIsTyping(true);
        try {
            // Use route('chat') if available, fallback to hardcoded path
            const chatUrl = typeof route !== 'undefined' ? route('chat') : '/chat';
            const response = await axios.post(chatUrl, { message: text });
            
            setIsTyping(false);
            const botReply = response.data.reply || "I'm sorry, I couldn't process that.";
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botReply, sender: 'bot', timestamp: new Date() }]);
        } catch (error) {
            console.error("SRDI Chatbot Error:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: "My apologies, I'm having trouble connecting to the SRDI laboratory servers right now. Please try again in a moment.", 
                sender: 'bot', 
                timestamp: new Date() 
            }]);
        }
    };

    const quickActions = [
        { label: 'Track my order', icon: ClipboardList },
        { label: 'Check stock', icon: Package },
        { label: 'Contact support', icon: Headphones },
    ];

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[200] w-16 h-16 rounded-full bg-[#3BAA35] flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 animate-bounce"
                title="Chat with SRDI Assistant"
            >
                <MessageSquare className="text-white" size={28} />
                <span className="absolute inset-0 rounded-full bg-[#3BAA35] animate-ping opacity-20 -z-10" />
            </button>
        );
    }

    return (
        <>
            {/* Backdrop for Full Screen Mode */}
            {isFullScreen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[240] animate-in fade-in duration-500"
                    onClick={() => setIsFullScreen(false)}
                />
            )}

            {/* Chat Container */}
            <div className={`fixed z-[250] transition-all duration-500 ease-in-out flex flex-col overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,10,0.15)] border border-slate-100 ${
                isFullScreen 
                ? 'inset-6 rounded-[3rem]' 
                : 'bottom-8 right-8 w-[400px] h-[600px] rounded-[2.5rem]'
            }`}>
                
                {/* Header */}
                <div className={`px-8 py-6 bg-[#0B1F3B] text-white shrink-0 relative flex items-center justify-between ${isFullScreen ? 'py-8' : ''}`}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Bot size={24} className="text-[#3BAA35]" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#3BAA35] border-2 border-[#0B1F3B] rounded-full" />
                        </div>
                        <div>
                            <h3 className={`${isFullScreen ? 'text-lg' : 'text-sm'} font-black uppercase tracking-widest`}>SRDI Workspace</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Protocol Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsFullScreen(!isFullScreen)} 
                            className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            title={isFullScreen ? "Minimize" : "Full Screen"}
                        >
                            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Body */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar"
                >
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                            <div className={`flex gap-4 ${isFullScreen ? 'max-w-[70%]' : 'max-w-[85%]'} ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border ${
                                    msg.sender === 'user' 
                                    ? 'bg-[#3BAA35] border-[#3BAA35] text-white shadow-lg shadow-[#3BAA35]/20' 
                                    : 'bg-white border-slate-100 text-[#0B1F3B] shadow-sm'
                                }`}>
                                    {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className="space-y-1.5">
                                    <div className={`px-5 py-4 rounded-[1.5rem] text-[14px] leading-relaxed shadow-sm ${
                                        msg.sender === 'user' 
                                        ? 'bg-[#0B1F3B] text-white rounded-tr-none' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'
                                    }`}>
                                        {msg.sender === 'user' ? msg.text : <FormattedMessage text={msg.text} />}
                                    </div>
                                    <p className={`text-[10px] font-extrabold uppercase tracking-widest text-slate-300 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#0B1F3B] shadow-sm">
                                    <Bot size={20} />
                                </div>
                                <div className="bg-white border border-slate-100 px-5 py-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-[#3BAA35] rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-[#3BAA35] rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 bg-[#3BAA35] rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input & Quick Actions Area */}
                <div className={`p-8 bg-white border-t border-slate-100 space-y-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] ${isFullScreen ? 'p-10' : ''}`}>
                    
                    {/* Quick Actions Scrollbox */}
                    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                        {quickActions.map((action, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(action.label)}
                                className="flex items-center gap-2.5 whitespace-nowrap px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-black text-[#0B1F3B] uppercase tracking-widest hover:bg-[#3BAA35] hover:text-white hover:border-[#3BAA35] transition-all active:scale-95 shadow-sm"
                            >
                                <action.icon size={14} />
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Text Input Group */}
                    <div className="relative group max-w-4xl mx-auto w-full">
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your inquiry to the assistant..."
                            className={`w-full bg-slate-50 border-slate-100 rounded-[2rem] pl-8 pr-16 py-5 text-sm font-bold text-[#0B1F3B] placeholder:text-slate-300 focus:bg-white focus:border-[#3BAA35] focus:ring-8 focus:ring-[#3BAA35]/5 transition-all outline-none ${isFullScreen ? 'text-base py-6' : ''}`}
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!inputValue.trim()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0B1F3B] text-white rounded-2xl flex items-center justify-center hover:bg-[#3BAA35] transition-all disabled:opacity-30 disabled:hover:bg-[#0B1F3B] shadow-xl shadow-[#0B1F3B]/10 active:scale-90"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </>
    );
}
