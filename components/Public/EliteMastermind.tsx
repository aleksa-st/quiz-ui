import React from 'react';
import { Button } from '../ui/Button';
import { Brain, Trophy, Medal, Star, Clock, FileCheck, LayoutDashboard, ArrowRight, BookOpen, GraduationCap, Lightbulb, Globe } from 'lucide-react';

interface EliteMastermindProps {
    onNavigate: (page: any) => void;
}

export const EliteMastermind: React.FC<EliteMastermindProps> = ({ onNavigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pt-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-violet-900 via-sky-900 to-violet-800 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-violet-100 font-bold mb-6">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span>KSoT's Structured Quiz Portal</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Elite Mastermind</h1>
                    <p className="text-xl text-violet-100 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Sharpen your analytical skills, academic knowledge, and competitive exam readiness through our structured online quiz competition platform.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="xl" onClick={() => onNavigate('discovery')} className="bg-yellow-500 hover:bg-yellow-600 border-0 text-violet-900 font-black">
                            Start Quiz Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="xl" variant="outline" onClick={() => onNavigate('register')} className="text-white border-white hover:bg-white/10">
                            Join as Member
                        </Button>
                    </div>
                </div>
            </section>

            {/* Quiz Categories */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Quiz Categories</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Explore a wide range of topics tailored for every level of learning.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: BookOpen,
                                title: "School Subjects",
                                items: ["Maths", "Science", "Social Science", "English", "Tamil"],
                                color: "bg-sky-50 text-sky-600 border-sky-100"
                            },
                            {
                                icon: GraduationCap,
                                title: "Competitive Exams",
                                items: ["TNPSC", "UPSC Basics", "SSC", "Banking", "General Awareness"],
                                color: "bg-purple-50 text-purple-600 border-purple-100"
                            },
                            {
                                icon: Lightbulb,
                                title: "Intelligence & Reasoning",
                                items: ["Logical Reasoning", "Analytical Ability", "Aptitude", "Puzzle Rounds"],
                                color: "bg-emerald-50 text-emerald-600 border-emerald-100"
                            },
                            {
                                icon: Globe,
                                title: "General Knowledge",
                                items: ["History", "Politics", "Constitution", "Current Affairs", "Geography"],
                                color: "bg-amber-50 text-amber-600 border-amber-100"
                            }
                        ].map((cat, i) => (
                            <div key={i} className={`p-8 rounded-3xl border ${cat.color} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}>
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">{cat.title}</h3>
                                <ul className="space-y-2">
                                    {cat.items.map((item, j) => (
                                        <li key={j} className="flex items-center gap-2 text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quiz Structure */}
            <section className="py-20 bg-white border-y border-slate-100 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                                Rigorous & Rewarding <span className="text-violet-600">Quiz Structure</span>
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                                Our levels are designed to take you from foundational understanding to competitive mastery.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Level 1 – Foundation", desc: "Build basic concepts and familiarity with the topic." },
                                    { title: "Level 2 – Advanced", desc: "Complex problems and deeper analytical challenges." },
                                    { title: "Level 3 – Championship", desc: "Elite level competition for top rankers." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">{step.title}</h4>
                                            <p className="text-slate-500">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                            {[
                                { icon: Clock, title: "Timed", value: "Questions" },
                                { icon: FileCheck, title: "Auto", value: "Scoring" },
                                { icon: Trophy, title: "Rank", value: "System" },
                                { icon: Medal, title: "Certificates", value: "Download" }
                            ].map((feature, i) => (
                                <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:bg-violet-600 hover:text-white transition-all duration-300">
                                    <feature.icon className="w-10 h-10 mb-4 text-violet-600 group-hover:text-white transition-colors" />
                                    <div className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">{feature.title}</div>
                                    <div className="text-xl font-black">{feature.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Features */}
            <section className="py-20 px-4 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-300 font-bold text-sm mb-6 border border-violet-500/30">
                            <LayoutDashboard className="w-4 h-4" /> Personal Learning Hub
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Student Dashboard Features</h2>
                        <p className="text-xl text-violet-200/60 max-w-2xl mx-auto">Track your growth and celebrate your achievements in real-time.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Attempt Quizzes", desc: "Access daily challenges and practice tests effortlessly." },
                            { title: "View Scores", desc: "Get detailed breakdown of your performance instantly." },
                            { title: "Download Certificate", desc: "Earn official KSoT certificates for your accomplishments." },
                            { title: "Track Performance", desc: "Visual charts to monitor your progress over time." },
                            { title: "Leaderboard Ranking", desc: "Compete globally and see where you stand." },
                            { title: "Hall of Fame", desc: "Get recognized as a top performer in the KSoT community." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-violet-200/60 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Button size="xl" onClick={() => onNavigate('register')} className="bg-violet-600 hover:bg-violet-700 text-white px-12 py-6 rounded-2xl shadow-2xl shadow-violet-500/20 text-xl font-black">
                            Create Your Dashboard Now
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

