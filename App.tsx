import React, { useState, useEffect } from 'react';
import { User, PageRoute, AppSettings } from './types';
import { api } from './services/api';
import { cacheService } from './services/cacheService';

// Components
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { ResetPassword } from './components/Auth/ResetPassword';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Feature Components
import { QuizDiscovery } from './components/Quiz/QuizDiscovery';
import { QuizDetails } from './components/Quiz/QuizDetails';
import { QuizPlay } from './components/Quiz/QuizPlay';
import { QuizResults } from './components/Quiz/QuizResults';
import { QuizHistory } from './components/Quiz/QuizHistory';
import { PersonalAnalytics } from './components/Analytics/PersonalAnalytics';
import { AchievementSystem } from './components/Achievements/AchievementSystem';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { ProfileManagement } from './components/Profile/ProfileManagement';
import { TeamList } from './components/Teams/TeamList';
import { TeamDetail } from './components/Teams/TeamDetail';
import { TeamChat } from './components/Teams/TeamChat';
import { DirectChat } from './components/Chat/DirectChat';
import { LiveQuiz } from './components/LiveQuiz/LiveQuiz';
import { LiveQuizLobby } from './components/LiveQuiz/LiveQuizLobby';
import { LiveQuizGame } from './components/LiveQuiz/LiveQuizGame';
import { PuzzleGame } from './components/PuzzleGame';
import QuizManagement from './components/Dashboard/QuizManagement';
import { ENV } from './src/config/env';
import Pusher from 'pusher-js';
import { notificationSystem } from './services/notificationSystem';

// Permission wrapper for create-quiz
const CreateQuizWithPermission: React.FC<{ onNavigate: (page: PageRoute) => void }> = ({ onNavigate }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const teamId = urlParams.get('teamId');

        if (!teamId) {
          setHasPermission(false);
          setIsLoading(false);
          return;
        }

        const response = await api.teams.getMyTeams();
        if (response.success && response.data) {
          const team = response.data.find((t: any) => t.id === parseInt(teamId));
          if (team) {
            const currentUser = team.members?.find((m: any) => m.name === 'You' || m.is_current_user);
            const userRole = currentUser?.role;
            setHasPermission(userRole === 'owner' || userRole === 'admin');
          } else {
            setHasPermission(false);
          }
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">Only team owners and admins can create quizzes.</p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => onNavigate('dashboard')}
        className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium"
      >
        ← Back to Dashboard
      </button>
      <QuizManagement />
    </div>
  );
};

// Simple placeholder for pages not fully implemented to ensure app runs
const PlaceholderPage: React.FC<{ title: string, onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="bg-gray-100 p-6 rounded-full mb-6">
      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-md mb-8">This feature is part of the full documentation specification but simplified for this demo.</p>
    <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-medium">
      &larr; Back to Dashboard
    </button>
  </div>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [route, setRoute] = useState(window.location.hash || '#landing'); // Simple hash router
  const [resetEmail, setResetEmail] = useState(''); // Store email for reset password flow
  const [selectedQuizId, setSelectedQuizId] = useState<number | undefined>(undefined);
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [puzzleDifficulty, setPuzzleDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Initial Load & Auth Check
  useEffect(() => {
    let isMounted = true;
    const initApp = async () => {
      if (!isMounted) return;
      const hashFull = window.location.hash.replace('#', '');
      const [hash] = hashFull.split('?');
      const search = window.location.search;

      const token = localStorage.getItem('auth_token');

      // Load app settings from cache or API
      let appSettings = cacheService.getAppSettings();
      if (!appSettings) {
        // Fetch from API if not in cache
        try {
          const settingsRes = await api.appSettings.get();
          if (settingsRes.success && settingsRes.data) {
            appSettings = settingsRes.data;
            cacheService.setAppSettings(appSettings);
          }
        } catch (err) {
          console.error("Failed to load settings", err);
        }
      }

      // Handle Settings
      if (appSettings) {
        setSettings(appSettings);
        if (appSettings.title) document.title = appSettings.title;
        if (appSettings.favicon) {
          // Fix: Create favicon link if it doesn't exist
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = appSettings.favicon;
        }
      }

      if (token) {
        try {
          // Try to load user from session cache first
          let userData = cacheService.getUserProfile();

          if (!userData) {
            // If not in cache, validate token and fetch from API
            const response = await api.auth.validateToken();
            if (response.success && response.data) {
              userData = response.data;
              cacheService.setUserProfile(userData);
            } else {
              throw new Error('Validation failed');
            }
          }

          if (userData) {
            setUser(userData);

            // Maintain current page on refresh if valid
            const validPages: PageRoute[] = ['dashboard', 'discovery', 'profile', 'teams', 'leaderboard', 'analytics', 'achievements', 'history', 'direct-chat', 'quiz-details', 'quiz-play', 'quiz-results', 'team-chat', 'live-quiz', 'live-quiz-lobby', 'live-quiz-game'];

            // Extract IDs from URL params or hash params
            const searchParams = new URLSearchParams(window.location.search);
            const hashQuery = hashFull.includes('?') ? hashFull.split('?')[1] : '';
            const hashParams = new URLSearchParams(hashQuery);

            const quizId = hashParams.get('quizId') || searchParams.get('quizId');
            const teamId = hashParams.get('teamId') || searchParams.get('teamId');

            if (quizId && ['quiz-details', 'quiz-play', 'quiz-results'].includes(hash.split('?')[0])) {
              setSelectedQuizId(parseInt(quizId));
            }
            if (teamId && ['teams', 'team-chat', 'live-quiz'].includes(hash.split('?')[0])) {
              setSelectedTeamId(parseInt(teamId));
            }

            if (hash && validPages.includes(hash as PageRoute)) {
              setRoute(`#${hashFull}`);
            } else if (['landing', 'login', 'register', 'forgot-password', 'reset-password'].includes(hash || '')) {
              setRoute('#dashboard');
            } else {
              setRoute(`#${hashFull || 'dashboard'}`);
            }
          } else {
            throw new Error('Validation failed');
          }
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem('auth_token');
          setUser(null);
          setRoute('#landing');
        }
      } else {
        // Handle Google Callback
        if (hash.startsWith('google-callback') || search.includes('token=')) {
          const urlParams = new URLSearchParams(search.startsWith('?') ? search.substring(1) : hashFull.includes('?') ? hashFull.split('?')[1] : '');
          const token = urlParams.get('token');
          const userId = urlParams.get('user_id');

          if (token && userId) {
            localStorage.setItem('auth_token', token);
            try {
              const response = await api.auth.validateToken();
              if (response.success && response.data) {
                setUser(response.data);
                setRoute('#dashboard');
                window.history.replaceState(null, '', '/#dashboard');
              } else {
                throw new Error('Token validation failed');
              }
            } catch (error) {
              console.error('Google auth failed:', error);
              localStorage.removeItem('auth_token');
              setRoute('#login');
            }
          } else {
            setRoute('#login');
          }
        } else {
          const publicPages: PageRoute[] = ['landing', 'login', 'register', 'forgot-password', 'reset-password'];
          if (publicPages.includes(hash as any)) {
            setRoute(`#${hash}`);
          } else {
            setRoute('#landing');
          }
        }
      }
      if (isMounted) setIsLoading(false);
    };

    initApp();
    return () => { isMounted = false; };
  }, []);

  // Sync hash with state and handle browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash;
      if (newHash && newHash !== route) {
        // Extract IDs from URL params or hash params
        const searchParams = new URLSearchParams(window.location.search);
        const hashQuery = newHash.includes('?') ? newHash.split('?')[1] : '';
        const hashParams = new URLSearchParams(hashQuery);

        const pageFromHash = (newHash.replace('#', '').split('?')[0]) as PageRoute;

        const quizId = hashParams.get('quizId') || searchParams.get('quizId');
        const teamId = hashParams.get('teamId') || searchParams.get('teamId');

        if (quizId && ['quiz-details', 'quiz-play', 'quiz-results'].includes(pageFromHash)) {
          setSelectedQuizId(parseInt(quizId));
        }
        if (teamId && ['teams', 'team-chat', 'live-quiz'].includes(pageFromHash)) {
          setSelectedTeamId(parseInt(teamId));
        }

        setRoute(newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [route]);

  // Update hash when page changes (but not on initial load)
  useEffect(() => {
    if (!isLoading && window.location.hash !== route) {
      window.location.hash = route;
    }
  }, [route, isLoading]);

  const handleNavigate = (page: PageRoute, data?: any) => {
    const newRoute = `#${page}`;
    console.log(`handleNavigate called: ${page} -> ${newRoute}, current user: ${!!user}`);

    // Auth guard
    if (!user && !['#landing', '#login', '#register', '#forgot-password', '#reset-password'].includes(newRoute)) {
      console.log('Auth guard blocked navigation, redirecting to login');
      setRoute('#login');
      return;
    }

    // Handle data passing and URL params
    const urlParams = new URLSearchParams(window.location.search);

    if (data !== undefined) {
      if (['quiz-details', 'quiz-play', 'quiz-results'].includes(page)) {
        setSelectedQuizId(data);
        urlParams.set('quizId', data.toString());
      }
      if (['teams', 'team-chat', 'live-quiz'].includes(page)) {
        const teamId = typeof data === 'object' ? data.teamId : data;
        setSelectedTeamId(teamId);
        urlParams.set('teamId', teamId.toString());
      }
      if (['live-quiz-lobby', 'live-quiz-game'].includes(page)) {
        if (typeof data === 'string') {
          setSessionCode(data);
        }
      }
    }

    // Update URL with params
    const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}${newRoute}` : `${window.location.pathname}${newRoute}`;
    window.history.replaceState(null, '', newUrl);

    setRoute(newRoute);
    window.scrollTo(0, 0);
  };

  // Listen for user profile updates from other components
  useEffect(() => {
    const handleUserUpdate = (event: any) => {
      const updatedUser = event.detail;
      if (updatedUser) {
        setUser(updatedUser);
      }
    };
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  // Real-time notifications via Pusher
  useEffect(() => {
    if (!user) return;

    // Request notification permission
    notificationSystem.requestPermission();

    const pusher = new Pusher(ENV.PUSHER_KEY, {
      cluster: ENV.PUSHER_CLUSTER,
    });

    // Global channel for new quizzes
    const globalChannel = pusher.subscribe('quizzes');
    globalChannel.bind('quiz-posted', (data: any) => {
      console.log('Quiz posted event received:', data);
      notificationSystem.show('New Quiz Posted!', {
        body: `${data.creator_name} just posted: ${data.quiz_name} in ${data.category}`,
        tag: `quiz-${data.quiz_id}`
      });
    });

    // User-specific channel for personal notifications (messages, challenges)
    const userChannel = pusher.subscribe(`user.${user.id}`);

    userChannel.bind('new-message', (data: any) => {
      console.log('New message event received:', data);
      notificationSystem.show('New Message Received', {
        body: data.message || 'You have a new direct message.',
        tag: 'new-message'
      });
    });

    userChannel.bind('challenge-received', (data: any) => {
      console.log('Challenge received event received:', data);
      notificationSystem.show('New Quiz Challenge!', {
        body: `${data.challenger_name} challenged you to: ${data.quiz_title}`,
        tag: `challenge-${data.challenge_id}`
      });
    });

    return () => {
      globalChannel.unbind_all();
      userChannel.unbind_all();
      pusher.unsubscribe('quizzes');
      pusher.unsubscribe(`user.${user.id}`);
      pusher.disconnect();
    };
  }, [user]);

  const handleLoginSuccess = async (token: string, userData: User) => {
    localStorage.setItem('auth_token', token);

    try {
      // Fetch full profile data once after login to ensure cache is fully populated with all fields
      const profileRes = await api.profile.get();
      if (profileRes.success && profileRes.data) {
        const fullUser = profileRes.data;
        setUser(fullUser);
        cacheService.setUserProfile(fullUser);
      } else {
        setUser(userData);
        cacheService.setUserProfile(userData);
      }
    } catch (error) {
      console.error('Failed to fetch full profile after login', error);
      setUser(userData);
      cacheService.setUserProfile(userData);
    }

    setRoute('#dashboard');
  };

  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      localStorage.removeItem('auth_token');
      // Clear cached profile on logout
      cacheService.clearUserProfile();
      setUser(null);
      handleNavigate('landing');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    const [pageRaw] = route.split('?');
    const page = pageRaw.trim();
    console.log(`App: route=[${route}] page=[${page}] selectedQuizId=${selectedQuizId}`);
    switch (page) {
      case '#landing':
        return <LandingPage
          settings={settings}
          onNavigateLogin={() => handleNavigate('login')}
          onNavigateRegister={() => handleNavigate('register')}
        />;
      case '#login':
        return <Login
          onLoginSuccess={handleLoginSuccess}
          onNavigateRegister={() => handleNavigate('register')}
          onNavigateForgotPassword={() => { console.log('App: Navigating to forgot-password'); handleNavigate('forgot-password'); }}
        />;
      case '#register':
        return <Register onRegisterSuccess={handleLoginSuccess} onNavigateLogin={() => handleNavigate('login')} />;
      case '#forgot-password':
        return <ForgotPassword
          onNavigateLogin={() => handleNavigate('login')}
          onNavigateReset={(email) => {
            setResetEmail(email);
            handleNavigate('reset-password');
          }}
        />;
      case '#reset-password':
        return <ResetPassword
          email={resetEmail}
          onNavigateLogin={() => handleNavigate('login')}
        />;
      case '#dashboard':
        return user ? <Dashboard user={user} onNavigate={handleNavigate} onOpenPuzzle={(diff) => { setPuzzleDifficulty(diff); setIsPuzzleOpen(true); }} /> : <Login onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => handleNavigate('register')} onNavigateForgotPassword={() => handleNavigate('forgot-password')} />;

      // Quiz Flow
      case '#discovery':
        return <QuizDiscovery onNavigate={handleNavigate} />;
      case '#quiz-details':
        {
          const searchParams = new URLSearchParams(window.location.search);
          const hashQuery = route.includes('?') ? route.split('?')[1] : '';
          const hashParams = new URLSearchParams(hashQuery);
          const qId = selectedQuizId || parseInt(hashParams.get('quizId') || searchParams.get('quizId') || '0');

          return qId ? (
            <QuizDetails
              quizId={qId}
              onNavigate={handleNavigate}
              onBack={() => handleNavigate('discovery')}
            />
          ) : (
            <QuizDiscovery onNavigate={handleNavigate} />
          );
        }
      case '#quiz-play':
        return selectedQuizId ? (
          <QuizPlay
            quizId={selectedQuizId}
            onComplete={(quizId) => handleNavigate('quiz-results', quizId)}
          />
        ) : (
          <QuizDiscovery onNavigate={handleNavigate} />
        );
      case '#quiz-results':
        return selectedQuizId ? (
          <QuizResults
            resultId={selectedQuizId}
            onNavigate={handleNavigate}
          />
        ) : (
          <Dashboard user={user!} onNavigate={handleNavigate} onOpenPuzzle={(diff) => { setPuzzleDifficulty(diff); setIsPuzzleOpen(true); }} />
        );

      case '#leaderboard':
        return <Leaderboard />;
      case '#profile':
        return <ProfileManagement />;

      case '#create-quiz':
        return <CreateQuizWithPermission onNavigate={handleNavigate} />;
      case '#analytics':
        return <PersonalAnalytics onNavigate={handleNavigate} />;
      case '#achievements':
        return <AchievementSystem onNavigate={handleNavigate} />;
      case '#teams':
        return selectedTeamId ? (
          <TeamDetail
            teamId={selectedTeamId}
            onNavigate={handleNavigate}
            onBack={() => { setSelectedTeamId(undefined); handleNavigate('teams'); }}
          />
        ) : (
          <TeamList onNavigate={handleNavigate} />
        );
      case '#team-chat':
        return selectedTeamId ? (
          <TeamChat
            teamId={selectedTeamId}
            onBack={() => handleNavigate('teams', { teamId: selectedTeamId })}
          />
        ) : (
          <TeamList onNavigate={handleNavigate} />
        );
      case '#direct-chat':
        return <DirectChat onBack={() => handleNavigate('dashboard')} />;
      case '#teams-discovery':
        return <TeamList onNavigate={handleNavigate} />;
      case '#history':
        return <QuizHistory onNavigate={handleNavigate} />;
      case '#live-quiz':
        return <LiveQuiz onNavigate={handleNavigate} teamId={selectedTeamId} />;
      case '#live-quiz-lobby':
        return sessionCode ? (
          <LiveQuizLobby
            sessionCode={sessionCode}
            onStartQuiz={() => handleNavigate('live-quiz-game', sessionCode)}
            onLeaveSession={() => handleNavigate('dashboard')}
          />
        ) : <Dashboard user={user!} onNavigate={handleNavigate} />;
      case '#live-quiz-game':
        return sessionCode ? (
          <LiveQuizGame
            sessionCode={sessionCode}
            onExit={() => handleNavigate('dashboard')}
          />
        ) : <Dashboard user={user!} onNavigate={handleNavigate} />;
      default:
        return <div className="p-8 text-center">Page not found</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {!isLoading && (
        <Header
          user={user}
          settings={settings}
          currentPage={route as PageRoute}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow">
        <ErrorBoundary key={route}>
          {renderContent()}
        </ErrorBoundary>
      </main>

      {!isLoading && <Footer settings={settings} />}

      {isPuzzleOpen && (
        <PuzzleGame
          difficulty={puzzleDifficulty}
          onClose={() => setIsPuzzleOpen(false)}
          onComplete={(points, xp) => {
            setIsPuzzleOpen(false);
            // Refresh user data to reflect new points
            if (user) {
              api.auth.validateToken().then(res => {
                if (res.success && res.data) {
                  setUser(res.data);
                  cacheService.setUserProfile(res.data);
                }
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default App;