import React from 'react';
import { Button } from '../ui/Button';
import { Trophy, Medal, Star, Crown, Users, Award, ExternalLink, ArrowRight } from 'lucide-react';

export const AchievementsPublic: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pt-20">
            {/* Hero */}
            <section className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <Crown className="w-16 h-16 mx-auto mb-6 text-white/50" />
                    <h1 className="text-4xl md:text-6xl font-black mb-6">Hall of Fame</h1>
                    <p className="text-xl text-amber-50 max-w-2xl mx-auto">
                        Celebrating the brilliance, dedication, and success of our top performers.
                    </p>
                </div>
            </section>

            {/* Top Performers */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            { rank: 2, name: "Arun Kumar", score: "9,850", avatar: "🥈" },
                            { rank: 1, name: "Sneha Reddy", score: "10,240", avatar: "🥇" },
                            { rank: 3, name: "Vikram Singh", score: "9,720", avatar: "🥉" }
                        ].map((hero, i) => (
                            <div key={i} className={`relative p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl flex flex-col items-center ${hero.rank === 1 ? 'md:-translate-y-8 border-amber-200' : ''}`}>
                                <div className={`w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl mb-6 ${hero.rank === 1 ? 'ring-8 ring-amber-50' : ''}`}>
                                    {hero.avatar}
                                </div>
                                <div className="text-violet-600 font-black mb-2 flex items-center gap-1 uppercase tracking-widest text-sm">
                                    <Trophy className="w-4 h-4" /> Rank {hero.rank}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">{hero.name}</h3>
                                <div className="text-slate-400 font-bold mb-6">Elite Mastermind Champion</div>
                                <div className="bg-slate-50 px-6 py-2 rounded-2xl font-black text-slate-900 text-xl border border-slate-100">
                                    {hero.score} PTS
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Scholarship Achievers</h2>
                        <p className="text-slate-500">Students who demonstrated exceptional excellence and earned KSoT scholarships.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:bg-violet-50 transition-colors">
                                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Student Name {i}</h4>
                                    <p className="text-xs text-slate-500">Excellence in Science</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-20 bg-white border-y border-slate-100 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-3">
                        <Star className="w-8 h-8 text-amber-500 fill-current" /> Success Stories
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        {[1, 2].map(i => (
                            <div key={i} className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-8 rounded-[2rem]">
                                <div className="w-32 h-32 bg-slate-200 rounded-[2rem] flex-shrink-0 flex items-center justify-center text-slate-400 font-bold">Photo</div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 italic">"How KSoT changed my perspective on competitive exams..."</h3>
                                    <p className="text-slate-600 mb-4">Detailed success story of a student who cleared TNPSC or UPSC basics using our portal...</p>
                                    <Button variant="ghost" className="text-violet-600 font-bold p-0 flex items-center gap-2">
                                        Read Full Story <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join the Hall of Fame */}
            <section className="py-20 px-4 bg-slate-900">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-white mb-6">Want to see your name here?</h2>
                    <p className="text-violet-200 mb-10 text-lg">Every champion was once a contender that refused to give up. Start your journey now.</p>
                    <Button size="xl" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-12 py-6 rounded-2xl shadow-2xl shadow-amber-500/20">
                        Take a Quiz Today
                    </Button>
                </div>
            </section>
        </div>
    );
};

