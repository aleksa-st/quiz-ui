import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { Brain, Users, Zap, Trophy, Rocket, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { AppSettings, LandingData } from '../types';

interface LandingPageProps {
  settings: AppSettings | null;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ settings, onNavigateLogin, onNavigateRegister }) => {
  // Use settings from props, no local state needed
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const landingRes = await api.quizzes.getLandingData();

        if (landingRes.success && landingRes.data) {
          setLandingData(landingRes.data);
        }

      } catch (error) {
        console.error("Failed to load landing data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-violet-100 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const appName = settings?.app_name || "Quiz App";
  const welcomeMsg = settings?.welcome_message || "Make Learning Super Fun!";

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-48 bg-playful">
        {/* Floating Background Doodles */}
        <div className="absolute top-20 right-10 animate-float text-6xl opacity-20 rotate-12">✏️</div>
        <div className="absolute top-40 left-10 animate-float-delayed text-6xl opacity-20 -rotate-12">📚</div>
        <div className="absolute bottom-20 right-1/4 animate-float text-6xl opacity-20 rotate-6">🧠</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border-2 border-violet-100 shadow-[0_4px_0_rgb(221,214,254)] mb-8 animate-bounce cursor-pointer hover:scale-105 transition-transform">
            <span className="text-sm font-extrabold text-violet-600 tracking-wide uppercase">✨ The #1 Learning App</span>
          </div>

          <div className="flex justify-center mb-8">
            {settings?.logo ? (
              <img src={settings.logo} alt={appName} className="h-24 md:h-32 object-contain drop-shadow-xl" />
            ) : (
              <div className="text-6xl">🎓</div>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-slate-900 leading-[1.1]">
            {welcomeMsg.split(' ').slice(0, 2).join(' ')} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 drop-shadow-sm">
              {welcomeMsg.split(' ').slice(2).join(' ')}
            </span> 🎢
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-10 font-bold leading-relaxed">
            {settings?.quiz_instructions || "Create quizzes, battle your friends, and collect badges. School just got a whole lot cooler."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            {settings?.allow_registration && (
              <Button size="xl" variant="primary" onClick={onNavigateRegister} className="text-lg">
                Get Started for Free
              </Button>
            )}
            <Button size="xl" variant="outline" onClick={onNavigateLogin} className="text-lg">
              I have an account
            </Button>
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-24 relative max-w-4xl mx-auto hidden md:block group">
            <div className="absolute inset-0 bg-violet-600 rounded-[3rem] rotate-3 opacity-20 blur-xl group-hover:rotate-6 transition-transform duration-500"></div>
            <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-2xl overflow-hidden relative z-10 aspect-video flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">🎮</div>
                <h3 className="text-3xl font-black text-slate-300">Gameplay Preview</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Why Students Love It</h2>
            <p className="text-xl font-bold text-slate-400">Warning: Highly Addictive Learning Inside</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: 'Smart AI', desc: 'Type a topic, get a quiz. Like magic!', color: 'bg-violet-500', shadow: 'shadow-violet-200' },
              { icon: Users, title: 'Team Battles', desc: 'Crush the leaderboard with your squad.', color: 'bg-blue-500', shadow: 'shadow-blue-200' },
              { icon: Zap, title: 'Live Games', desc: 'Fastest finger wins! Are you ready?', color: 'bg-yellow-400', shadow: 'shadow-yellow-200' },
              { icon: Trophy, title: 'Rewards', desc: 'Earn badges and level up your profile.', color: 'bg-pink-500', shadow: 'shadow-pink-200' }
            ].map((feature, idx) => (
              <div key={idx} className={`p-8 rounded-[2rem] border-2 border-slate-100 hover:border-slate-300 hover:scale-[1.02] transition-all duration-300 bg-white shadow-xl ${feature.shadow}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-[0_6px_0_rgba(0,0,0,0.2)] ${feature.color} -rotate-3`}>
                  <feature.icon className="h-8 w-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
            {[
              { val: landingData?.stats?.total_users || '10K+', label: 'Students' },
              { val: landingData?.stats?.total_quizzes || '500K', label: 'Quizzes' },
              { val: landingData?.stats?.total_questions || '1M+', label: 'Questions' },
              { val: landingData?.stats?.average_rating || '4.9', label: 'Stars' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-6xl font-black text-white mb-2">{stat.val}</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-500 font-bold">
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </div>
            <div className="flex gap-6">
              {settings?.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-600 transition-colors">Facebook</a>
              )}
              {settings?.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors">Twitter</a>
              )}
              {settings?.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">Instagram</a>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-sm font-bold text-slate-400">
            {settings?.terms_url && <a href={settings.terms_url} className="hover:text-violet-600">Terms</a>}
            {settings?.privacy_url && <a href={settings.privacy_url} className="hover:text-violet-600">Privacy</a>}
            {settings?.contact_email && <a href={`mailto:${settings.contact_email}`} className="hover:text-violet-600">Contact</a>}
          </div>
        </div>
      </footer>
    </div>
  );
};