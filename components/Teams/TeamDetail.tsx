import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Team, PageRoute } from '../../types';
import { Button } from '../ui/Button';
import { Loader2, ArrowLeft, Users, Trophy, MessageCircle, Settings, UserPlus, Shield, Crown, Trash2, Edit, Zap } from 'lucide-react';
import { InviteMemberModal } from './InviteMemberModal';

interface TeamDetailProps {
    teamId: number;
    onNavigate: (page: PageRoute, data?: any) => void;
    onBack: () => void;
}

export const TeamDetail: React.FC<TeamDetailProps> = ({ teamId, onNavigate, onBack }) => {
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null); // Simplified user check
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        loadTeamDetails();
    }, [teamId]);

    const loadTeamDetails = async () => {
        try {
            setLoading(true);
            // Since there's no single endpoint for team details yet, we fetch all and find
            const res = await api.teams.getMyTeams();
            if (res.success) {
                const found = res.data.find((t: any) => t.id === teamId);
                if (found) {
                    setTeam(found);
                    const me = found.members?.find((m: any) => m.name === 'You' || m.is_current_user);
                    setCurrentUser(me);
                }
            }
        } catch (error) {
            console.error("Failed to load team", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (userId: number) => {
        if (!confirm("Promote this member to Admin?")) return;
        try {
            await api.teams.promoteMember(teamId, userId);
            loadTeamDetails();
        } catch (e) {
            console.error(e);
        }
    };

    const handleKick = async (userId: number) => {
        if (!confirm("Remove this member from the team?")) return;
        try {
            await api.teams.removeMember(teamId, userId);
            loadTeamDetails();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!team) {
        return <div className="text-center p-8">Team not found</div>;
    }

    const isOwner = currentUser?.role === 'owner';
    // const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Button variant="ghost" onClick={onBack} className="mb-6 pl-0 hover:bg-transparent hover:text-violet-600">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Teams
            </Button>

            {/* Header Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-3xl bg-violet-100 flex items-center justify-center text-3xl font-black text-violet-600 shadow-inner">
                        {team.avatar ? (
                            <img src={team.avatar} alt={team.name} className="w-full h-full object-cover rounded-3xl" />
                        ) : (
                            team.name.substring(0, 2).toUpperCase()
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-slate-900 mb-2">{team.name}</h1>
                        <p className="text-slate-500 text-lg mb-6">{team.description}</p>

                        <div className="flex flex-wrap gap-4">
                            {/* Live Quiz Button - Kahoot Style! */}
                            <Button
                                onClick={() => onNavigate('live-quiz', { teamId: team.id })}
                                className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                <Zap className="h-5 w-5 mr-2" /> Live Quiz
                            </Button>

                            <Button
                                onClick={() => onNavigate('team-chat', { teamId: team.id })}
                                className="bg-pink-500 hover:bg-pink-600 text-white border-0"
                            >
                                <MessageCircle className="h-5 w-5 mr-2" /> Team Chat
                            </Button>

                            <Button onClick={() => setShowInviteModal(true)}>
                                <UserPlus className="h-5 w-5 mr-2" /> Invite Members
                            </Button>

                            {/* {isOwner && (
                                <Button variant="secondary">
                                    <Settings className="h-5 w-5 mr-2" /> Settings
                                </Button>
                            )} */}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="bg-violet-50 rounded-2xl p-4 text-center min-w-[100px]">
                            <Users className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                            <div className="text-2xl font-black text-slate-900">{team.members?.length || 0}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Members</div>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-4 text-center min-w-[100px]">
                            <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                            <div className="text-2xl font-black text-slate-900">{team.total_score || 0}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Score</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <Users className="h-6 w-6 mr-3 text-violet-600" />
                    Team Members
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {team.members?.sort((a, b) => b.total_score - a.total_score).map((member, index) => (
                        <div key={member.id} className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-violet-200 hover:shadow-lg transition-all group relative">
                            {/* Rank Badge */}
                            <div className="absolute top-4 right-4 text-xs font-black text-slate-300">#{index + 1}</div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            member.avatar_initials || member.name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    {member.role === 'owner' && (
                                        <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white" title="Owner">
                                            <Crown className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    {member.role === 'admin' && (
                                        <div className="absolute -bottom-1 -right-1 bg-sky-500 p-1 rounded-full border-2 border-white" title="Admin">
                                            <Shield className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {member.name === 'You' ? 'You' : member.name}
                                    </h3>
                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        <span className="bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded">
                                            {member.total_score} XP
                                        </span>
                                        <span>• Joined {member.joined_date}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions (Only visible for owner/admin on others) */}
                            {isOwner && member.name !== 'You' && (
                                <div className="flex gap-2 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs" onClick={() => onNavigate('direct-chat', { userId: member.id })}>
                                        Chat
                                    </Button>
                                    {member.role === 'member' && (
                                        <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50" onClick={() => handlePromote(member.id)}>
                                            Promote
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleKick(member.id)}>
                                        Kick
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showInviteModal && (
                <InviteMemberModal
                    teamId={teamId}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
        </div>
    );
};

