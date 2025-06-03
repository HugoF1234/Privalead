import React, { useState } from 'react';
import { 
  BarChart3, User, History, Calendar, Settings, LogOut, 
  TrendingUp, Newspaper, Bell, Search, Plus, Menu, X,
  Zap, Target, MessageSquare, BookOpen
} from 'lucide-react';

const ModernSidebar = ({ currentView, setCurrentView, user, collapsed, onToggle }) => {
  const [notifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: BarChart3, 
      label: 'Dashboard', 
      color: 'from-blue-500 to-blue-600',
      badge: null
    },
    { 
      id: 'create', 
      icon: Plus, 
      label: 'Créer', 
      color: 'from-green-500 to-green-600',
      badge: null
    },
    { 
      id: 'calendar', 
      icon: Calendar, 
      label: 'Calendrier', 
      color: 'from-purple-500 to-purple-600',
      badge: '7'
    },
    { 
      id: 'analytics', 
      icon: TrendingUp, 
      label: 'Analytics', 
      color: 'from-orange-500 to-red-500',
      badge: null
    },
    { 
      id: 'news', 
      icon: Newspaper, 
      label: 'Actualités', 
      color: 'from-red-500 to-pink-500',
      badge: 'NEW'
    },
    { 
      id: 'history', 
      icon: History, 
      label: 'Historique', 
      color: 'from-gray-500 to-gray-600',
      badge: null
    }
  ];

  const quickActions = [
    { icon: Zap, label: 'IA Boost', color: 'from-yellow-400 to-orange-500' },
    { icon: Target, label: 'Tendances', color: 'from-green-400 to-blue-500' },
    { icon: MessageSquare, label: 'Engagement', color: 'from-purple-400 to-pink-500' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 
        transition-all duration-300 ease-in-out z-50 shadow-2xl
        ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-80 lg:w-72'}
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LinkedBoost
                </h1>
                <p className="text-xs text-gray-500">Propulsez votre LinkedIn</p>
              </div>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        {!collapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`
                  group relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg transform scale-[1.02]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
                
                <div className={`
                  flex items-center justify-center w-6 h-6 
                  ${isActive ? 'transform rotate-12' : 'group-hover:scale-110'}
                  transition-transform duration-300
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {!collapsed && (
                  <>
                    <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`
                        px-2 py-1 text-xs font-bold rounded-full
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-100 text-blue-600'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-gray-200/50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Actions rapides
            </p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button 
                    key={index}
                    className="group p-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200/50">
          {!collapsed ? (
            <div className="space-y-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifications > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {notifications}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">Notifications</span>
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>
              </div>

              {/* Settings & Logout */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('settings')}
                  className="flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl hover:bg-gray-50 transition-all text-gray-600"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Paramètres</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                      window.location.reload();
                    }
                  }}
                  className="flex items-center justify-center p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all text-gray-600"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button className="w-full p-3 rounded-xl hover:bg-gray-50 transition-all flex justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-full p-3 rounded-xl hover:bg-gray-50 transition-all flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-60 p-3 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
};

export default ModernSidebar;