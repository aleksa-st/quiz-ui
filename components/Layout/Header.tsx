import React, { useState, useEffect, useRef } from 'react';
import { User, PageRoute, AppSettings } from '../../types';
import { Button } from '../ui/Button';
import { Menu, X, LogOut, Zap, LayoutGrid, Compass, Users, Trophy, PlusCircle, BarChart2, MessageCircle, Mail, Swords } from 'lucide-react';
import { api } from '../../services/api';
import Pusher from 'pusher-js';
import { ENV } from '../../src/config/env';

interface HeaderProps {
  user: User | null;
  settings: AppSettings | null;
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
  }, [user?.id]); // Only depend on user ID to prevent unnecessary re-runs

  useEffect(() => {
    const handleUserUpdate = (event: any) => {
      if (event.detail?.avatar_url && user) {
        // Force re-render by updating user object
        const updatedUser = { ...user, avatar_url: event.detail.avatar_url };
        // This will trigger a re-render of the header component
        window.location.reload();
      }
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, [user]);

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
        console.log('Challenge data:', challenges.data);
        console.log('First challenge status:', challenges.data[0]?.status);
        const pending = challenges.data.length; // All received challenges are pending
        setPendingChallenges(pending);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const setupPusher = async () => {
    try {
      pusherRef.current = new Pusher(ENV.PUSHER_KEY, { cluster: ENV.PUSHER_CLUSTER });
      const channel = pusherRef.current.subscribe(`user.${user?.id}`);
      
      channel.bind('new-message', () => {
        setUnreadMessages(prev => prev + 1);
      });
      
      channel.bind('team-invitation', () => {
        setPendingInvites(prev => prev + 1);
      });
      
      channel.bind('challenge-received', () => {
        setPendingChallenges(prev => prev + 1);
      });
      
      channel.bind('challenge-accepted', () => {
        setPendingChallenges(prev => Math.max(0, prev - 1));
      });
      
      channel.bind('challenge-declined', () => {
        setPendingChallenges(prev => Math.max(0, prev - 1));
      });
    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  };

  const handleNav = (page: PageRoute) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Dashboard', page: 'dashboard', icon: LayoutGrid },
    { label: 'Explore', page: 'discovery', icon: Compass },
    { label: 'Teams', page: 'teams', icon: Users },
    { label: 'Leaderboard', page: 'leaderboard', icon: Trophy },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border-2 border-white shadow-xl shadow-slate-200/40 rounded-3xl pointer-events-auto">
        <div className="flex justify-between h-20 items-center px-6">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleNav(user ? 'dashboard' : 'landing')}>
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.app_name} className="w-10 h-10 object-contain mr-3" />
            ) : (
              <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center mr-3 shadow-[0_4px_0_rgb(109,40,217)] group-hover:translate-y-1 group-hover:shadow-none transition-all">
                <Zap className="w-6 h-6 text-white fill-yellow-300" />
              </div>
            )}
            <span className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-violet-600 transition-colors hidden sm:block">
              {settings?.app_name || 'Aleksa Quiz'}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {user && navItems.map((item) => (
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

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <button onClick={() => handleNav('direct-chat')} className="relative p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>
                <button onClick={() => handleNav('teams')} className="relative p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <Mail className="h-5 w-5" />
                  {pendingInvites > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingInvites > 9 ? '9+' : pendingInvites}
                    </span>
                  )}
                </button>
                <button onClick={() => handleNav('dashboard')} className="relative p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <Swords className="h-5 w-5" />
                  {pendingChallenges > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingChallenges > 9 ? '9+' : pendingChallenges}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 bg-slate-100 pl-1 pr-4 py-1 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleNav('profile')}>
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden">
                    {(user.avatar_url || user.avatar) ? (
                      <img src={user.avatar_url || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-sky-400 flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 leading-none">{user.name}</div>
                    <div className="text-[10px] font-black text-violet-500 uppercase">Level {Math.floor((user.total_xp || 0) / 100) + 1}</div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => handleNav('login')} className="font-bold">Log in</Button>
                <Button variant="primary" onClick={() => handleNav('register')} className="shadow-lg shadow-violet-500/20">
                  Join Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-1 lg:hidden">
            {user && (
              <>
                <button onClick={() => handleNav('direct-chat')} className="relative p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>
                <button onClick={() => handleNav('teams')} className="relative p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <Mail className="h-6 w-6" />
                  {pendingInvites > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {pendingInvites > 9 ? '9+' : pendingInvites}
                    </span>
                  )}
                </button>
                <button onClick={() => handleNav('dashboard')} className="relative p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                  <Swords className="h-6 w-6" />
                  {pendingChallenges > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {pendingChallenges > 9 ? '9+' : pendingChallenges}
                    </span>
                  )}
                </button>
              </>
            )}
            {user && (
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-7 w-7" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white border-2 border-slate-100 rounded-3xl shadow-xl overflow-hidden pointer-events-auto mx-4 sm:mx-6">
          <div className="p-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 rounded-2xl border border-slate-100" onClick={() => handleNav('profile')}>
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 overflow-hidden">
                    {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-sky-400 flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{user.name}</div>
                    <div className="text-xs font-bold text-violet-500 uppercase">View Profile</div>
                  </div>
                </div>

                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNav(item.page as PageRoute)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <item.icon className="h-5 w-5 text-slate-400" />
                    {item.label}
                  </button>
                ))}

                <div className="h-px bg-slate-100 my-2"></div>
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50">
                  <LogOut className="h-7 w-7" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-center" onClick={() => handleNav('login')}>Log In</Button>
                <Button variant="primary" className="w-full justify-center" onClick={() => handleNav('register')}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};