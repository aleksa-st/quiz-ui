import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Team, PageRoute } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Plus, Users, Search, ArrowRight, Loader2, Mail } from 'lucide-react';
import { CreateTeamModal } from './CreateTeamModal';

interface TeamListProps {
    onNavigate: (page: PageRoute, data?: any) => void;
}

export const TeamList: React.FC<TeamListProps> = ({ onNavigate }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(false); // Show UI immediately
        const loadTeams = async () => {
            if (isMounted) {
                await fetchTeams();
            }
        };
        loadTeams();
        return () => { isMounted = false; };
    }, []);

    const fetchTeams = async () => {
        try {
            const [teamsRes, invitesRes] = await Promise.all([
                api.teams.getMyTeams(),
                api.teams.getInvitations()
            ]);

            if (teamsRes.success) {
                setTeams(teamsRes.data);
            }
            if (invitesRes.success) {
                setInvitations(invitesRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch teams', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (data: { name: string; description: string }) => {
        try {
            const res = await api.teams.create(data);
            if (res.success) {
                setShowCreateModal(false);
                fetchTeams(); // Refresh list
                onNavigate('teams', res.data.id); // Navigate to new team? Or just list? 
                // Let's just refresh for now
            }
        } catch (error) {
            console.error('Failed to create team', error);
        }
    };

    const handleInvitation = async (id: number, action: 'accept' | 'decline') => {
        try {
            await api.teams.respondInvitation(id, action);
            fetchTeams(); // Refresh to see new team or removed invite
        } catch (error) {
            console.error('Failed to respond to invitation', error);
        }
    };



    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">My Teams</h1>
                    <p className="text-slate-500">Collaborate, chat, and compete with friends.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Team
                </Button>
            </div>

            {/* Invitations Section */}
            {invitations.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Pending Invitations</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {invitations.map(invite => (
                            <div key={invite.id} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-bl-full -mr-12 -mt-12"></div>
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
                                            <Mail className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <span className="text-xs font-bold text-orange-700 bg-orange-200 px-3 py-1 rounded-full uppercase tracking-wider">
                                            Pending
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-xl mb-2">{invite.team_name}</h3>
                                    <p className="text-slate-600 text-sm mb-6 line-clamp-2">{invite.team_description}</p>
                                    <div className="flex gap-3">
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                                            onClick={() => handleInvitation(invite.id, 'accept')}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="flex-1 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 font-medium"
                                            onClick={() => handleInvitation(invite.id, 'decline')}
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Teams Grid */}
            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 shadow-xl animate-pulse">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-200"></div>
                                <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="h-6 w-full bg-slate-200 rounded mb-2"></div>
                            <div className="h-10 w-full bg-slate-200 rounded mb-6"></div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <div className="flex -space-x-2">
                                    {Array(3).fill(0).map((_, j) => (
                                        <div key={j} className="w-8 h-8 rounded-full bg-slate-200"></div>
                                    ))}
                                </div>
                                <div className="h-4 w-12 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : teams.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Teams Yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        Join a team to collaborate on quizzes or create your own to invite friends.
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        Create Your First Team
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map(team => (
                        <div
                            key={team.id}
                            className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 cursor-pointer relative group overflow-hidden border border-slate-100"
                            onClick={() => onNavigate('teams', { teamId: team.id })}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    {team.avatar_url ? (
                                        <img src={team.avatar_url} alt={team.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-4 ring-white" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-violet-500/30 ring-4 ring-white">
                                            {team.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                                        ${team.role === 'owner'
                                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}
                                    >
                                        {team.role === 'owner' ? 'Owner' : 'Member'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-xl text-slate-900 mb-2 truncate group-hover:text-violet-600 transition-colors">
                                    {team.name}
                                </h3>

                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                                    {team.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(3, team.members_count || 1))].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {i === 0 && team.avatar_url ? "" : "?"}
                                            </div>
                                        ))}
                                        {(team.members_count || 0) > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                +{(team.members_count || 0) - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(team.role === 'owner' || team.role === 'admin') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onNavigate('create-quiz');
                                                }}
                                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
                                            >
                                                + Quiz
                                            </button>
                                        )}
                                        <div className="text-sm font-bold text-slate-300 group-hover:text-violet-600 transition-colors flex items-center">
                                            View <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateTeamModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateTeam}
                />
            )}
        </div>
    );
};

