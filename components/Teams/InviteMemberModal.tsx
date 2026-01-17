import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { User } from '../../types';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';

interface InviteMemberModalProps {
    teamId: number;
    onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ teamId, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await api.teams.searchUsers(query);
                if (res.success) {
                    setResults(res.data);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const toggleUser = (user: User) => {
        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleInvite = async () => {
        if (selectedUsers.length === 0) return;
        setSending(true);
        try {
            await api.teams.invite(teamId, selectedUsers.map(u => u.id));
            onClose();
            // Could trigger a toast here if we had one
        } catch (error) {
            console.error("Invite failed", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-black text-slate-900 mb-1">Invite Members</h2>
                <p className="text-slate-500 mb-6">Search for friends to add to your team.</p>

                <div className="relative mb-4">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                        placeholder="Search by name or email..."
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-[200px] mb-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        </div>
                    ) : results.length > 0 ? (
                        results.map(user => {
                            const isSelected = selectedUsers.some(u => u.id === user.id);
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => toggleUser(user)}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {user.avatar_initials || user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-900">{user.name}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                                        }`}>
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                </div>
                            );
                        })
                    ) : query.length > 1 ? (
                        <p className="text-center text-slate-400 py-8">No users found.</p>
                    ) : (
                        <p className="text-center text-slate-400 py-8">Type to search...</p>
                    )}
                </div>

                <Button
                    onClick={handleInvite}
                    disabled={selectedUsers.length === 0 || sending}
                    className="w-full"
                >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : `Invite ${selectedUsers.length} Users`}
                </Button>
            </div>
        </div>
    );
};
