import React, { useState, useEffect } from 'react';
import {
    Heart,
    Users,
    Award,
    Globe,
    ArrowRight,
    CheckCircle2,
    Clock,
    Smile,
    Zap,
    Star,
    ShieldCheck,
    ChevronRight,
    HandHelping
} from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export const Volunteer: React.FC = () => {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                const res = await api.publicData.getVolunteerOpportunities();
                if (res.success) {
                    setOpportunities(res.data);
                }
            } catch (error) {
                console.error("Error fetching opportunities:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOpportunities();
    }, []);

    return (
        <div className="min-h-screen bg-white pt-28 pb-20 font-sans">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm mb-6 border border-emerald-100">
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Be a Part of Something Bigger</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
                    Join the <span className="text-emerald-600">Movement</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                    KSoT is built by a community of dedicated volunteers. Your time and talents can help us reach more students and create more impact.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    {/* Left: Content */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 mb-8">Why Volunteer with Us?</h2>
                            <div className="space-y-8">
                                {[
                                    { icon: Award, title: 'Build Your Resume', desc: 'Gain valuable experience in EdTech, leadership, and community management.' },
                                    { icon: Globe, title: 'Statewide Impact', desc: 'Work on projects that reach thousands of students across Tamil Nadu.' },
                                    { icon: Smile, title: 'Positive Environment', desc: 'Join a team of motivated, like-minded individuals driven by social change.' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-emerald-100">
                                            <item.icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 mb-2">{item.title}</h4>
                                            <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-900/10">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <Zap className="text-emerald-400 w-6 h-6 fill-current" /> Immediate Openings
                            </h3>
                            <div className="space-y-6">
                                {isLoading ? (
                                    <div className="p-4 bg-white/5 rounded-2xl animate-pulse h-20"></div>
                                ) : (
                                    opportunities.map((opp) => (
                                        <div key={opp.id} className="group p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-lg font-black group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{opp.role_name}</h4>
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest">{opp.location}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                                {opp.description}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {opp.requirements?.slice(0, 2).map((req: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-300 font-bold">
                                                        <CheckCircle2 className="w-3" /> {req}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Application Card */}
                    <div className="sticky top-32">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
                            <h3 className="text-3xl font-black text-slate-900 mb-4">Start Your Journey</h3>
                            <p className="text-slate-500 mb-10 font-bold">Fill out this quick form and our team will get back to you within 48 hours.</p>

                            <form className="space-y-6">
                                <div className="space-y-8">
                                    <div className="relative">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1">Full Name</label>
                                        <input type="text" className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:outline-none font-bold text-slate-700 transition-all" placeholder="John Doe" />
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1">Email Address</label>
                                        <input type="email" className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:outline-none font-bold text-slate-700 transition-all" placeholder="john@example.com" />
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1">Interested Role</label>
                                        <select className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer">
                                            <option>Select a role</option>
                                            {opportunities.map(opp => <option key={opp.id}>{opp.role_name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <Button size="xl" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl h-16 shadow-xl shadow-emerald-100 mt-10">
                                    Apply to Volunteer
                                </Button>
                            </form>

                            <div className="mt-10 flex items-center justify-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" /> 100% Safe & Secure Data
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
