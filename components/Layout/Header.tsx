import React, { useState, useEffect, useRef } from 'react';
import { User, PageRoute, Settings } from '../../types';
import { Button } from '../ui/Button';
import {
  Menu, X, LogOut, Zap, LayoutGrid, Compass,
  Users, Trophy, MessageCircle, Mail, Swords, Rocket
} from 'lucide-react';
import { api } from '../../services/api';
import Pusher from 'pusher-js';
import { ENV } from '../../src/config/env';
import { notificationSystem } from '../../services/notificationSystem';

interface HeaderProps {
  user: User | null;
  settings: Settings | null;
  onNavigate: (page: PageRoute) => void;
  onLogout: () => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ user, settings, onNavigate, onLogout, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingInvites, setPendingInvites] = useState(0);
  const [pendingChallenges, setPendingChallenges] = useState(0);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (user && isMounted) {
      fetchCounts();
      setupPusher();
    }
    return () => {
      isMounted = false;
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [user?.id]);

  const fetchCounts = async () => {
    try {
      const [conversations, invites, challenges] = await Promise.all([
        api.chat.getConversations(),
        api.teams.getInvitations(),
        api.challenges.getReceived()
      ]);

      if (conversations.success) {
        const unread = conversations.data.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0);
        setUnreadMessages(unread);
      }
      if (invites.success) {
        setPendingInvites(invites.data.length);
      }
      if (challenges.success) {
        setPendingChallenges(challenges.data.length);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const setupPusher = async () => {
    try {
      pusherRef.current = new Pusher(ENV.PUSHER_KEY, { cluster: ENV.PUSHER_CLUSTER });
      const channel = pusherRef.current.subscribe(`user.${user?.id}`);

      channel.bind('new-message', (data: any) => {
        setUnreadMessages(prev => prev + 1);
        notificationSystem.show(`Message`, { body: data.message || 'New message received' });
      });

      channel.bind('team-invitation', () => setPendingInvites(prev => prev + 1));
      channel.bind('challenge-received', () => setPendingChallenges(prev => prev + 1));
    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  };

  const handleNav = (page: PageRoute) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Dashboard', page: 'dashboard', icon: LayoutGrid, private: true },
    { label: 'Explore', page: 'discovery', icon: Compass, private: true },
    { label: 'Teams', page: 'teams', icon: Users, private: true },
    { label: 'Leaderboard', page: 'leaderboard', icon: Trophy, private: true },

    // Public Items
    { label: 'Home', page: 'home', icon: Compass, public: true },
    { label: 'Mastermind', page: 'elite-mastermind', icon: Zap, public: true },
    { label: 'Skill Dev', page: 'skill-development', icon: Rocket, public: true },
    { label: 'Events', page: 'competitions', icon: Trophy, public: true },
    { label: 'Contact', page: 'contact', icon: Mail, public: true },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-auto">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border-2 border-white shadow-xl shadow-slate-200/40 rounded-3xl">
        <div className="flex justify-between h-20 items-center px-6">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleNav(user ? 'dashboard' : 'home')}>
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center mr-3 shadow-lg overflow-hidden">
              {settings?.logo ? (
                <img src={settings.logo} className="w-full h-full object-cover" alt={settings.app_name} />
              ) : (
                <Zap className="w-6 h-6 text-white fill-yellow-300" />
              )}
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-violet-600 transition-colors hidden sm:block">
              {settings?.app_name || 'KSoT Portal'}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems
              .filter(item => user ? item.private : item.public)
              .map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.page as PageRoute)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border-2 border-transparent ${currentPage === item.page
                    ? 'bg-violet-100 text-violet-700 border-violet-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <item.icon className={`h-4 w-4 ${currentPage === item.page ? 'fill-current' : ''}`} />
                  {item.label}
                </button>
              ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <button onClick={() => handleNav('direct-chat')} className="relative p-2 rounded-xl text-slate-500 hover:bg-violet-50">
                    <MessageCircle className="h-5 w-5" />
                    {unreadMessages > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>}
                  </button>
                  <button onClick={() => handleNav('teams')} className="relative p-2 rounded-xl text-slate-500 hover:bg-violet-50">
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 pl-1 pr-4 py-1 rounded-full border border-slate-200 cursor-pointer" onClick={() => handleNav('profile')}>
                  <div className="w-8 h-8 rounded-full bg-white overflow-hidden">
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-violet-500 flex items-center justify-center text-white text-xs">{user.name.charAt(0)}</div>}
                  </div>
                  <span className="text-sm font-bold text-slate-700 hidden sm:inline">{user.name}</span>
                </div>
                <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut className="h-5 w-5" /></button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Button variant="ghost" onClick={() => handleNav('login')} className="font-bold">Log in</Button>
                <Button size="lg" onClick={() => handleNav('register')} className="bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200">Join KSoT</Button>
              </div>
            )}

            <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 h-6" /> : <Menu className="h-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white border-2 border-slate-100 rounded-3xl shadow-xl p-4 space-y-2">
          {navItems
            .filter(item => user ? item.private : item.public)
            .map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page as PageRoute)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-violet-50"
              >
                <item.icon className="h-5 w-5 text-slate-400" />
                {item.label}
              </button>
            ))}
          {!user && (
            <div className="pt-4 grid grid-cols-2 gap-4">
              <Button variant="ghost" onClick={() => handleNav('login')}>Log In</Button>
              <Button onClick={() => handleNav('register')}>Sign Up</Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
