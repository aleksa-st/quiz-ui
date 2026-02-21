import React, { useState, useEffect } from 'react';
import {
    Rocket,
    Target,
    Users,
    Zap,
    CheckCircle2,
    ChevronRight,
    Clock,
    Star,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Cpu,
    Palette,
    Mic2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export const SkillDevelopment: React.FC = () => {
    const [programs, setPrograms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await api.publicData.getPrograms();
                if (res.success) {
                    setPrograms(res.data);
                }
            } catch (error) {
                console.error("Error fetching programs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-bold text-sm mb-6 border border-rose-200">
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Transforming Potential into Excellence</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                    Level Up Your <span className="text-rose-600">Skills</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                    Expert-led workshops and training programs designed to prepare students for the competitive world of tomorrow.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-10">
                        {[1, 2].map(i => <div key={i} className="bg-white h-96 rounded-[2.5rem] animate-pulse"></div>)}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-12">
                        {programs.map((program) => (
                            <div key={program.id} className="group bg-white rounded-[3rem] p-10 border-2 border-slate-50 hover:border-rose-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-rose-100/40 transition-all duration-500">
                                <div className="flex flex-col md:flex-row gap-10">
                                    <div className="w-full md:w-48 h-48 rounded-[2.5rem] overflow-hidden bg-rose-50 flex-shrink-0 shadow-inner">
                                        <img src={program.image_url} alt={program.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-4 py-1 rounded-full bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                                                {program.duration}
                                            </span>
                                            <span className="flex items-center gap-1 text-amber-500 font-black text-xs">
                                                <Star className="w-3 h-3 fill-current" /> 4.9
                                            </span>
                                        </div>

                                        <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-rose-600 transition-colors">
                                            {program.title}
                                        </h3>
                                        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                                            {program.description}
                                        </p>

                                        <div className="space-y-3 mb-8">
                                            {program.features?.map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-rose-500" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 font-black text-xs">
                                                    {program.trainer_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Expert Mentor</div>
                                                    <div className="text-xs font-bold text-slate-700">{program.trainer_name}</div>
                                                </div>
                                            </div>
                                            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black px-8">
                                                Enroll Now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
