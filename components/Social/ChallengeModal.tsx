import React, { useState, useEffect } from 'react';
import { X, Swords, Search, Send, Check } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

interface ChallengeModalProps {
    onClose: () => void;
    quizResultId: number;
    quizTitle: string;
    score: number;
}

interface ChallengeableUser {
    id: number;
    name: string;
    avatar?: string;
    teamName: string;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ onClose, quizResultId, quizTitle, score }) => {
    const [users, setUsers] = useState<ChallengeableUser[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.teams.getMyTeams();
            if (res.success) {
                const allUsers: ChallengeableUser[] = [];
                const seenIds = new Set<number>();

                res.data.forEach(team => {
                    team.members?.forEach(member => {
                        // Filter out self (assuming "You" or checking is_current_user if available, 
                        // but here we might rely on name until we have strict ID check)
                        if (member.name !== 'You' && !seenIds.has(member.id)) {
                            seenIds.add(member.id);
                            allUsers.push({
                                id: member.id,
                                name: member.name,
                                avatar: member.avatar,
                                teamName: team.name
                            });
                        }
                    });
                });
                setUsers(allUsers);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (selectedUserIds.length === 0) return;
        setSending(true);
        try {
            await api.challenges.send({
                quiz_result_id: quizResultId,
                challenged_user_ids: selectedUserIds,
                message,
                challenger_score: score
            });
            setSent(true);
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error("Failed to send challenge", error);
            setSending(false);
        }
    };

    const toggleUser = (id: number) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <Swords className="h-6 w-6" /> Challenge Friends
                        </h2>
                        <p className="text-orange-100 mt-1">
                            Dare them to beat your score of <strong className="text-white">{score}</strong> on {quizTitle}!
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {sent ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Check className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Challenge Sent!</h3>
                        <p className="text-slate-500 mt-2">Your friends have been notified.</p>
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                            <input
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* List */}
                        <div className="h-60 overflow-y-auto mb-6 pr-2 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="text-center py-10 text-slate-400">Loading friends...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">No friends found. Join a team first!</div>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUser(user.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selectedUserIds.includes(user.id)
                                                ? 'bg-orange-50 border-orange-200 shadow-sm'
                                                : 'border-transparent hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${selectedUserIds.includes(user.id) ? 'bg-orange-500 border-orange-500' : 'border-slate-300'
                                            }`}>
                                            {selectedUserIds.includes(user.id) && <Check className="h-3 w-3 text-white" />}
                                        </div>

                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-500 font-bold">
                                            {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.teamName}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message */}
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-6 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                            placeholder="Add a taunting message... (optional)"
                            rows={2}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />

                        {/* Action */}
                        <Button
                            onClick={handleSend}
                            disabled={selectedUserIds.length === 0 || sending}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg shadow-lg shadow-orange-500/30"
                        >
                            {sending ? 'Sending...' : `Send Challenge (${selectedUserIds.length})`} <Send className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
