import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import {
  Trophy,
  Users,
  ChevronRight,
  Star,
  ArrowRight,
  Brain,
  Rocket,
  Sparkles,
  Award,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  Heart,
  Medal,
  Globe,
  Crown
} from 'lucide-react';
import { api } from '../services/api';
import { PageRoute, Settings, LeaderboardEntry, Feedback, Challenge } from '../types';

interface LandingPageProps {
  settings: Settings | null;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigatePage?: (page: PageRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  onNavigateLogin,
  onNavigateRegister,
  onNavigatePage
}) => {
  const [stats, setStats] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Quiz State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizStatus, setQuizStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const startQuiz = async () => {
    if (isQuizLoading) return;
    setIsQuizLoading(true);
    try {
      const res = await api.publicData.getRandomQuestions();
      if (res.success) {
        setQuizQuestions(res.data);
        setQuizStatus('playing');
        setCurrentQuizIndex(0);
        setQuizAnswers({});
      }
    } catch (err) {
      console.error("Failed to load quiz", err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleAnswer = (optionKey: string) => {
    setQuizAnswers(prev => ({ ...prev, [currentQuizIndex]: optionKey }));

    setTimeout(() => {
      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
      } else {
        setQuizStatus('finished');
      }
    }, 600);
  };

  const calculateQuizScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer[0]) {
        score++;
      }
    });
    return score;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, feedbackRes, statsRes, programsRes] = await Promise.all([
          api.landing.getLeaderboard(),
          api.landing.getFeedbacks(),
          api.publicData.getStats(),
          api.publicData.getPrograms()
        ]);

        if (usersRes.success) setTopUsers(usersRes.data.slice(0, 3));
        if (feedbackRes.success) setFeedbacks(feedbackRes.data.slice(0, 3));
        if (statsRes.success) setStats(statsRes.data);
        if (programsRes.success) setPrograms(programsRes.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching landing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigate = (page: PageRoute) => {
    if (onNavigatePage) {
      onNavigatePage(page);
    } else {
      window.location.hash = `#${page}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 lg:pt-20 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-50/50 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-sky-100 rounded-full blur-3xl opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-bold text-[10px] sm:text-sm mb-6 sm:mb-8 border border-violet-200 leading-tight">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Nurturing the Next Generation of Thinkers</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.1] sm:leading-[1.05] tracking-tight mb-6 sm:mb-8">
                Kalam School <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-violet-600 to-sky-600">
                  of Thought
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Inspiring students to think critically, lead boldly, and excel academically through a structured platform of knowledge and skill-building.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="xl"
                  onClick={() => navigate('elite-mastermind')}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-2xl shadow-violet-200 text-base sm:text-lg font-black w-full sm:w-auto"
                >
                  Join Elite Mastermind <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => navigate('volunteer')}
                  className="border-2 border-slate-200 hover:border-violet-600 hover:bg-violet-50 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-black w-full sm:w-auto"
                >
                  Join as Volunteer
                </Button>
              </div>

              <div className="mt-10 sm:mt-12 flex items-center justify-center lg:justify-start gap-6 sm:gap-8 opacity-60">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-slate-900">{stats?.students || '10k+'}</div>
                  <div className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-widest">Students</div>
                </div>
                <div className="h-8 w-px bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-slate-900">{stats?.questions || '1.2M'}</div>
                  <div className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-widest">Questions</div>
                </div>
                <div className="h-8 w-px bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-slate-900">{stats?.districts || '32'}</div>
                  <div className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-widest">Districts</div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/5 relative w-full max-w-md lg:max-w-none mx-auto mt-12 lg:mt-0">
              <div className="relative z-10 transform scale-100 lg:scale-125 hover:rotate-1 transition-transform duration-700">
                <div className="bg-gradient-to-br from-violet-600 to-violet-800 p-2 rounded-[3.5rem] shadow-3xl">
                  <div className="bg-slate-900 rounded-[3rem] overflow-hidden min-h-[480px] sm:min-h-[520px] flex flex-col relative p-6 sm:p-8">
                    <div className="absolute inset-0 bg-violet-500/10 backdrop-blur-3xl"></div>

                    {quizStatus === 'idle' && (
                      <div className="z-10 text-center my-auto py-8">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-md border border-white/20">
                          <Brain className="w-10 h-10 text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Daily Quick Challenge</h3>
                        <p className="text-violet-200 mb-8 text-sm px-4">5 Questions • Random Topics • Instant Result</p>
                        <Button
                          onClick={startQuiz}
                          disabled={isQuizLoading}
                          className="w-full bg-violet-600 text-white font-black py-4 px-8 rounded-2xl hover:bg-violet-500 transition-all shadow-xl shadow-violet-900/40"
                        >
                          {isQuizLoading ? 'Loading Quiz...' : 'Play Now'}
                        </Button>
                      </div>
                    )}

                    {quizStatus === 'playing' && quizQuestions[currentQuizIndex] && (
                      <div className="z-10 flex flex-col h-full py-4">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Question {currentQuizIndex + 1}/5</span>
                          <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 transition-all duration-500"
                              style={{ width: `${((currentQuizIndex + 1) / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <h4 className="text-lg sm:text-xl font-bold text-white mb-8 leading-tight">
                          {quizQuestions[currentQuizIndex].question_text}
                        </h4>

                        <div className="space-y-3 pb-4">
                          {quizQuestions[currentQuizIndex].options.map((opt: any) => (
                            <button
                              key={opt.key}
                              onClick={() => handleAnswer(opt.key)}
                              disabled={!!quizAnswers[currentQuizIndex]}
                              className={`w-full p-4 rounded-xl text-left text-sm font-bold transition-all border flex items-start gap-3 ${quizAnswers[currentQuizIndex] === opt.key
                                ? 'bg-violet-600 border-violet-400 text-white shadow-lg scale-[1.02]'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                              <span className="flex-shrink-0 inline-block w-6 h-6 rounded-lg bg-black/20 text-center leading-6 text-[10px] uppercase mt-0.5">{opt.key}</span>
                              <span className="flex-1 leading-snug">{opt.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {quizStatus === 'finished' && (
                      <div className="z-10 text-center my-auto py-8">
                        <div className="w-20 h-20 bg-green-500/20 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-md border border-green-500/30">
                          <Trophy className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Quiz Completed!</h3>
                        <div className="text-5xl font-black text-white my-6">
                          {calculateQuizScore()}/5
                        </div>
                        <p className="text-slate-400 mb-8 text-sm px-4">
                          {calculateQuizScore() === 5 ? 'Perfect Score! You are brilliant!' :
                            calculateQuizScore() >= 3 ? 'Great job! Keep it up!' : 'Good effort! Try again for a better score.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={startQuiz}
                            variant="outline-white"
                            className="flex-1 border-white/10 text-white hover:bg-white/5 font-black py-4 rounded-2xl"
                          >
                            Restart
                          </Button>
                          <Button
                            onClick={() => onNavigatePage && onNavigatePage('register')}
                            className="flex-1 bg-violet-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-violet-900/40"
                          >
                            Join Full Quiz
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col justify-end border border-slate-100">
                  <div className="w-12 h-12 bg-violet-100 rounded-2xl text-violet-600 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Our Mission</h3>
                  <p className="text-sm text-slate-500">To inspire students across Tamil Nadu to reach their full potential.</p>
                </div>
                <div className="aspect-square bg-slate-900 rounded-[2.5rem] shadow-xl p-8 flex flex-col justify-end mt-8">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl text-white flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1">Our Vision</h3>
                  <p className="text-sm text-slate-400">Building a smarter, more capable society through education.</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 order-1 lg:order-2">
              <div className="text-violet-600 font-black uppercase tracking-[0.2em] text-sm mb-4 flex items-center gap-2">
                <div className="w-8 h-px bg-violet-600"></div>
                Know About KSoT
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-tight">
                Transforming the <span className="text-violet-600">Educational Landscape</span>
              </h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Kalam School of Thought (KSoT) is not just a portal; it's a movement named after the visionary Dr. APJ Abdul Kalam. We bridge the gap between classroom learning and real-world excellence.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Nurturing analytical and critical thinking skills.",
                  "Connecting students with expert mentors and leaders.",
                  "Providing resources for competitive exam readiness.",
                  "Instilling a sense of responsibility and leadership."
                ].map((item, j) => (
                  <li key={j} className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="xl" onClick={() => navigate('elite-mastermind')} variant="outline" className="border-2 border-slate-900 text-slate-900 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                Discover Our Impact
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Our Core Programs</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Diverse platforms for students to showcase and sharpen their skills.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-slate-50 p-10 rounded-[2.5rem] animate-pulse h-80"></div>
              ))
            ) : programs.length > 0 ? (
              programs.map((program, k) => (
                <div key={k} className="group bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-300">
                  <div className={`w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform`}>
                    <Rocket className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{program.title}</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed font-medium line-clamp-2">{program.description}</p>
                  <Button onClick={() => navigate('skill-development')} variant="ghost" className="p-0 text-violet-600 font-bold group-hover:translate-x-2 transition-transform">
                    Learn More <ChevronRight className="ml-1 w-5 h-5" />
                  </Button>
                </div>
              ))
            ) : (
              [
                { title: "Elite Mastermind", desc: "An advanced quiz portal covering school subjects and competitive exams.", icon: Trophy, color: "bg-amber-100 text-amber-600", page: 'elite-mastermind' },
                { title: "Skill Development", desc: "Workshops on public speaking, leadership, and personality enhancement.", icon: Rocket, color: "bg-purple-100 text-purple-600", page: 'skill-development' },
                { title: "Competitions", desc: "Annual contests in essay, speech, drawing, and debate across the state.", icon: Star, color: "bg-sky-100 text-sky-600", page: 'competitions' },
                { title: "Resources Hub", desc: "Free access to GK PDFs, study materials, and current affairs updates.", icon: BookOpen, color: "bg-emerald-100 text-emerald-600", page: 'resources' },
                { title: "Hall of Fame", desc: "Celebrating champions who achieved excellence in our programs.", icon: Award, color: "bg-red-100 text-red-600", page: 'achievements-public' },
                { title: "Voice of Hope", desc: "A public interaction platform for sharing innovative thoughts and ideas.", icon: MessageCircle, color: "bg-violet-100 text-violet-600", page: 'contact' }
              ].map((program, k) => (
                <div key={k} className="group bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-300">
                  <div className={`w-16 h-16 ${program.color} rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform`}>
                    <program.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{program.title}</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed font-medium">{program.desc}</p>
                  <Button onClick={() => navigate(program.page as PageRoute)} variant="ghost" className="p-0 text-violet-600 font-bold group-hover:translate-x-2 transition-transform">
                    Learn More <ChevronRight className="ml-1 w-5 h-5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-slate-900 text-white px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: "Total Students", value: stats?.students || "25k+", icon: Users },
              { label: "Questions Answered", value: stats?.questions || "1.2M", icon: Brain },
              { label: "Active Districts", value: stats?.districts || "32", icon: Globe },
              { label: "Awards Given", value: stats?.awards || "1000+", icon: Medal }
            ].map((stat, m) => (
              <div key={m} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <stat.icon className="w-8 h-8 text-violet-400" />
                </div>
                <div className="text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-violet-300 font-bold uppercase tracking-widest text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-violet-200">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              Be a part of the <br />
              <span className="italic">Reason for Change.</span>
            </h2>
            <p className="text-xl text-violet-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Whether you're a student looking to learn or a volunteer eager to give back, KSoT welcomes you with open arms.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="xl" onClick={() => navigate('register')} className="bg-white text-violet-600 hover:bg-slate-100 px-12 py-6 rounded-2xl text-xl font-black shadow-xl">
                Get Started Today
              </Button>
              <Button size="xl" onClick={() => navigate('volunteer')} variant="outline" className="text-white border-2 border-white/20 hover:bg-white/10 px-12 py-6 rounded-2xl text-xl font-black">
                Learn About Volunteering
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
