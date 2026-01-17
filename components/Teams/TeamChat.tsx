import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { TeamMessage, PageRoute } from '../../types';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface TeamChatProps {
    teamId: number;
    onBack: () => void;
}

export const TeamChat: React.FC<TeamChatProps> = ({ teamId, onBack }) => {
    const [messages, setMessages] = useState<TeamMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [teamName, setTeamName] = useState('Team Chat');

    useEffect(() => {
        // Fetch team details for name
        api.teams.getMyTeams().then(res => {
            if (res.success) {
                const team = res.data.find(t => t.id === teamId);
                if (team) setTeamName(team.name);
            }
        });

        loadMessages();
        const interval = setInterval(loadMessages, 3000); // Polling every 3s
        return () => clearInterval(interval);
    }, [teamId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        try {
            const res = await api.teams.getMessages(teamId); // This returns messages directly or wrapped
            // Check api.ts implementation: request<import('../types').TeamMessage[]>
            if (res.success) {
                // If the API returns { data: [...] } structure
                // But looking at legacy, it returned { data: messages }
                // My api.ts helper unwraps 'data' property? No, handleResponse returns the whole JSON usually
                // BUT my handleResponse returns `data` from response.json().
                // `api.teams.getMessages` in api.ts types it as `TeamMessage[]`.
                // Let's assume res.data is the array.
                const msgs = Array.isArray(res.data) ? res.data : (res.data as any).messages || [];
                // Simple dedup based on ID if needed, or just replace
                setMessages(msgs);
            }
        } catch (error) {
            // console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await api.teams.sendMessage(teamId, newMessage);
            setNewMessage('');
            loadMessages(); // Refresh immediately
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl my-4 border border-slate-200">
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex items-center gap-4 shrink-0">
                <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10 p-2 h-auto">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="font-bold text-lg">{teamName}</h2>
                    <p className="text-indigo-200 text-xs">Team Chat</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center pt-10">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`flex gap-3 ${msg.is_own ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0">
                                {msg.avatar ? (
                                    <img src={msg.avatar} alt={msg.user_name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${msg.is_own ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                        {msg.avatar_initials}
                                    </div>
                                )}
                            </div>
                            <div className={`max-w-[70%] flex flex-col ${msg.is_own ? 'items-end' : 'items-start'}`}>
                                {!msg.is_own && <span className="text-xs text-slate-500 mb-1 ml-1">{msg.user_name}</span>}
                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.is_own
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
                                    }`}>
                                    {msg.message}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 mx-1 opacity-70">
                                    {msg.created_at}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        className="flex-1 px-4 py-3 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || sending} className="aspect-square h-auto rounded-xl">
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};
