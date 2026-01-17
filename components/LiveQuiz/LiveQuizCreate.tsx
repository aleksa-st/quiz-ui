import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Check, Search, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

interface LiveQuizCreateProps {
    teamId?: number;
    onSessionCreated: (sessionId: string) => void;
    onBack: () => void;
}

interface TeamQuiz {
    id: number;
    name: string;
    description: string;
    total_questions: number;
    category: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_initials?: string;
    is_online?: boolean;
    role: string;
}

export const LiveQuizCreate: React.FC<LiveQuizCreateProps> = ({
    teamId,
    onSessionCreated,
    onBack
}) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Quiz selection
    const [quizzes, setQuizzes] = useState<TeamQuiz[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

    // Step 2: Time configuration
    const [timePerQuestion, setTimePerQuestion] = useState<10 | 20 | 30>(30);

    // Step 3: Member selection
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    useEffect(() => {
        loadQuizzes();
        loadTeamMembers();
    }, [teamId]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.quizzes.getExplore();
            if (response.success && response.data) {
                const formattedQuizzes = response.data.map((quiz: any) => ({
                    id: quiz.id,
                    name: quiz.title || quiz.name,
                    description: quiz.description || '',
                    total_questions: quiz.questions_count || quiz.total_questions || 10,
                    category: quiz.category || 'General'
                }));
                setQuizzes(formattedQuizzes);
            }
        } catch (error) {
            console.error('Failed to load quizzes:', error);
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const loadTeamMembers = async () => {
        if (!teamId) return;

        try {
            const response = await api.teams.getDetails(teamId);
            if (response.success && response.data.members) {
                const formattedMembers = response.data.members.map((member: any) => ({
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    avatar: member.avatar,
                    avatar_initials: member.avatar_initials || member.name.substring(0, 2).toUpperCase(),
                    is_online: member.is_online || false,
                    role: member.role || 'member'
                }));
                setTeamMembers(formattedMembers);
            }
        } catch (error) {
            console.error('Failed to load team members:', error);
            setTeamMembers([]);
        }
    };

    const handleCreateSession = async () => {
        if (!selectedQuiz || selectedMembers.length === 0) return;

        try {
            setLoading(true);
            const response = await api.liveQuiz.create({
                quiz_id: selectedQuiz,
                time_per_question: timePerQuestion,
                // max_participants: selectedMembers.length + 1 // +1 for host
            });

            if (response.success) {
                // TODO: Send invitations to selected members
                // await api.liveQuiz.invite(sessionId, selectedMembers);
                onSessionCreated(response.data.session_code);
            }
        } catch (error) {
            console.error('Failed to create session:', error);
            alert('Failed to create session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (memberId: number) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const toggleAll = () => {
        if (selectedMembers.length === filteredMembers.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(filteredMembers.map(m => m.id));
        }
    };

    const filteredMembers = teamMembers.filter(member => {
        if (!memberSearchQuery.trim()) return true; // Show all if no search query
        const query = memberSearchQuery.toLowerCase().trim();
        const nameMatch = member.name?.toLowerCase().includes(query) || false;
        const emailMatch = member.email?.toLowerCase().includes(query) || false;
        return nameMatch || emailMatch;
    });

    const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={onBack}
                            className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-white text-3xl font-black">Create Live Quiz Session</h1>
                            <p className="text-white/70 text-sm mt-1">
                                Step {step} of 3: {step === 1 ? 'Select Quiz' : step === 2 ? 'Configure Time' : 'Invite Members'}
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${step >= s
                                    ? 'bg-white text-purple-600'
                                    : 'bg-white/20 text-white/50'
                                    }`}>
                                    {step > s ? <Check className="w-5 h-5" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 transition ${step > s ? 'bg-white' : 'bg-white/20'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl p-6 min-h-[400px]">
                        {/* Step 1: Quiz Selection */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a Quiz</h2>
                                <p className="text-gray-600 mb-4">Choose which quiz your team will play</p>

                                {/* Search */}
                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search quizzes..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                        {quizzes.map((quiz) => (
                                            <button
                                                key={quiz.id}
                                                onClick={() => setSelectedQuiz(quiz.id)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedQuiz === quiz.id
                                                    ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                                                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 text-lg">{quiz.name}</h3>
                                                        <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                                                                {quiz.total_questions} questions
                                                            </span>
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                                                {quiz.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedQuiz === quiz.id && (
                                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Time Configuration */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Configure Time Limit</h2>
                                <p className="text-gray-600 mb-6">How much time per question?</p>

                                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                                    {([10, 20, 30] as const).map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setTimePerQuestion(time)}
                                            className={`p-6 rounded-2xl border-2 transition-all ${timePerQuestion === time
                                                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                                                }`}
                                        >
                                            <Clock className={`w-8 h-8 mx-auto mb-2 ${timePerQuestion === time ? 'text-purple-600' : 'text-gray-400'
                                                }`} />
                                            <div className="text-3xl font-black text-gray-900">{time}s</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {time === 10 ? 'Fast' : time === 20 ? 'Medium' : 'Relaxed'}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h3 className="font-bold text-blue-900 mb-2">Selected Quiz</h3>
                                    <p className="text-blue-800">{selectedQuizData?.name}</p>
                                    <p className="text-blue-600 text-sm">{selectedQuizData?.total_questions} questions × {timePerQuestion}s = {selectedQuizData && selectedQuizData.total_questions * timePerQuestion}s total</p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Member Selection */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Team Members</h2>
                                <p className="text-gray-600 mb-6">Select who you want to invite to this quiz</p>

                                {/* Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={memberSearchQuery}
                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Select All */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedMembers.length} of {filteredMembers.length} selected
                                    </span>
                                    <button
                                        onClick={toggleAll}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                    >
                                        {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>

                                {/* Member List */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {filteredMembers.map((member) => (
                                        <button
                                            key={member.id}
                                            onClick={() => toggleMember(member.id)}
                                            className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${selectedMembers.includes(member.id)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                        >
                                            {/* Checkbox */}
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedMembers.includes(member.id)
                                                ? 'bg-purple-600 border-purple-600'
                                                : 'border-gray-300'
                                                }`}>
                                                {selectedMembers.includes(member.id) && (
                                                    <Check className="w-4 h-4 text-white" />
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                                {member.avatar_initials}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 text-left">
                                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                    {member.name}
                                                    {member.role === 'owner' && <span className="text-xs">👑</span>}
                                                    {member.role === 'admin' && <span className="text-xs">🛡️</span>}
                                                </div>
                                                <div className="text-xs text-gray-600">{member.email}</div>
                                            </div>

                                            {/* Online Status */}
                                            <div className={`w-3 h-3 rounded-full ${member.is_online ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => step > 1 ? setStep((step - 1) as 1 | 2 | 3) : onBack()}
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </Button>

                        <Button
                            onClick={() => {
                                if (step < 3) {
                                    setStep((step + 1) as 1 | 2 | 3);
                                } else {
                                    handleCreateSession();
                                }
                            }}
                            disabled={
                                (step === 1 && !selectedQuiz) ||
                                (step === 3 && selectedMembers.length === 0) ||
                                loading
                            }
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Starting...
                                </>
                            ) : step === 2 ? (
                                <>
                                    <Users className="w-5 h-5 mr-2" />
                                    Start Live Quiz
                                </>
                            ) : (
                                'Next →'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
