import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Calendar,
    MapPin,
    ChevronRight,
    Clock,
    Star,
    CheckCircle2,
    ArrowRight,
    ShieldAlert,
    Target,
    Sparkles,
    Award
} from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export const OnlineCompetitions: React.FC = () => {
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompetitions = async () => {
            try {
                const res = await api.publicData.getCompetitions();
                if (res.success) {
                    setCompetitions(res.data);
                }
            } catch (error) {
                console.error("Error fetching competitions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompetitions();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-6 border border-amber-200">
                    <Trophy className="w-4 h-4" />
                    <span>Showcase Your Excellence to the World</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    Annual & Online <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                        Competitions
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                    Participate in a variety of state-level contests designed to challenge your intellect, creativity, and leadership skills.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {[1, 2].map(i => <div key={i} className="bg-white h-96 rounded-[2.5rem] animate-pulse"></div>)}
                    </div>
                ) : competitions.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-12">
                        {competitions.map((comp) => (
                            <div key={comp.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300 flex flex-col">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={comp.image_url} alt={comp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-black text-xs uppercase tracking-widest shadow-sm">
                                            {comp.type}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-sm">
                                            {comp.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-10 flex-grow flex flex-col">
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-amber-600 transition-colors">
                                        {comp.title}
                                    </h3>
                                    <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                                        {comp.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-6 mb-8 mt-auto">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Starts On</div>
                                                <div className="text-sm font-bold">{new Date(comp.start_date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Reg. Deadline</div>
                                                <div className="text-sm font-bold text-red-500">{new Date(comp.registration_deadline).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {comp.prizes && comp.prizes.length > 0 && (
                                        <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 mb-8">
                                            <h4 className="flex items-center gap-2 text-amber-700 font-black text-sm uppercase tracking-widest mb-4">
                                                <Award className="w-4 h-4" /> Grand Prizes
                                            </h4>
                                            <ul className="space-y-2">
                                                {comp.prizes.map((prize: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                        {prize}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <Button
                                        as="a"
                                        href={comp.registration_link}
                                        target="_blank"
                                        size="xl"
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl h-16 shadow-xl shadow-slate-200"
                                    >
                                        Register Now <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-2xl font-bold text-slate-400">No active competitions at the moment.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
