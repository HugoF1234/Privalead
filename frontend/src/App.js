import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, Search, User, Wifi, WifiOff } from 'lucide-react';

// Import des composants modernes
import ModernSidebar from './components/ModernSidebar';
import ModernDashboard from './components/ModernDashboard';
import PostGenerator from './components/PostGenerator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ModernCalendar from './components/ModernCalendar';
import LinkedInDashboard from './components/LinkedIn/LinkedInDashboard';
import PostGenerator from './components/LinkedIn/PostGenerator';


const ModernLinkedBoostApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState({
    firstName: 'Hugo',
    lastName: 'Founder',
    email: 'hugo@linkedboost.com',
    sector: 'tech'
  });
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notifications] = useState([
    {
      id: 1,
      title: 'Post performant !',
      message: 'Votre dernier post a généré +340% d\'engagement',
      time: '5min',
      type: 'success'
    },
    {
      id: 2,
      title: 'Nouveau follower',
      message: 'Sarah Martin a commencé à vous suivre',
      time: '1h',
      type: 'info'
    },
    {
      id: 3,
      title: 'Suggestion IA',
      message: 'Moment optimal pour publier: Demain 9h',
      time: '2h',
      type: 'tip'
    }
  ]);

  // Simulation du chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Test de connexion simulé
  useEffect(() => {
    const connectionTest = setInterval(() => {
      // Simulation d'une connexion instable
      const isConnected = Math.random() > 0.1; // 90% de chances d'être connecté
      setConnected(isConnected);
    }, 30000); // Test toutes les 30 secondes

    return () => clearInterval(connectionTest);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderCurrentView = () => {
    switch(currentView) {
      case 'dashboard':
        return <ModernDashboard user={user} />;
      case 'create':
        return (
          <div className="p-6">
            <PostGenerator />
          </div>
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'calendar':
        return <ModernCalendar />;
      case 'news':
        return <NewsView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'linkedin':
        return <LinkedInDashboard user={user} />;
      case 'linkedin-create':
        return <PostGenerator onPublish={() => setCurrentView('linkedin')} />;
      default:
        return <ModernDashboard user={user} />;
    }
  };

  // Composant de chargement ultra-moderne
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center relative overflow-hidden">
        {/* Animations de fond */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center text-white">
          {/* Logo animé */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/30">
              <div className="w-10 h-10 bg-gradient-to-r from-white to-white/80 rounded-xl animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              LinkedBoost
            </h1>
            <p className="text-white/80 text-lg mt-2">Propulsez votre LinkedIn</p>
          </div>
          
          {/* Indicateur de chargement */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <p className="text-white/90">Initialisation de l'application...</p>
              <div className="w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-white/60 to-white animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <ModernSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left Side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {connected ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">Connecté</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">Hors ligne</span>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{notifications.length}</span>
                    </div>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.sector}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition-transform">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="relative">
          {!connected && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 mx-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Mode hors ligne:</strong> Certaines fonctionnalités peuvent être limitées.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {renderCurrentView()}
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setCurrentView('create')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200/50">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600">API Active</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-gray-500">
              Dernière sync: {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants placeholder pour les vues non encore développées
const NewsView = () => (
  <div className="p-8 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
        <span className="text-3xl">📰</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Actualités</h2>
      <p className="text-gray-600 mb-6">
        Découvrez les dernières nouvelles de votre secteur pour créer du contenu pertinent.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">🚧 Fonctionnalité en développement</p>
      </div>
    </div>
  </div>
);

const HistoryView = () => (
  <div className="p-8 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
        <span className="text-3xl">📚</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Historique</h2>
      <p className="text-gray-600 mb-6">
        Consultez l'historique complet de vos publications et leurs performances.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">🚧 Fonctionnalité en développement</p>
      </div>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="p-8 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
        <span className="text-3xl">⚙️</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h2>
      <p className="text-gray-600 mb-6">
        Configurez vos préférences et gérez votre compte LinkedBoost.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">🚧 Fonctionnalité en développement</p>
      </div>
    </div>
  </div>
);

export default ModernLinkedBoostApp;
