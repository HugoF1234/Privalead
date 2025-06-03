import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, 
  Plus, Edit3, Eye, Send, MoreHorizontal,
  Filter, Search, Target, Zap, CheckCircle
} from 'lucide-react';

const ModernCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Données simulées des posts programmés
  const scheduledPosts = [
    {
      id: 1,
      title: '🚀 Innovation dans l\'IA',
      content: 'Comment l\'intelligence artificielle transforme notre façon de travailler...',
      date: new Date(2025, 4, 28, 9, 0), // 28 mai 2025, 9h00
      status: 'scheduled',
      engagement: { estimated: 'High', score: 85 },
      platform: 'linkedin'
    },
    {
      id: 2,
      title: '💡 Leadership tips',
      content: '3 conseils pour devenir un leader inspirant en 2025...',
      date: new Date(2025, 4, 29, 14, 30),
      status: 'scheduled',
      engagement: { estimated: 'Medium', score: 72 },
      platform: 'linkedin'
    },
    {
      id: 3,
      title: '🎯 Success Story',
      content: 'Comment nous avons multiplié notre engagement par 3...',
      date: new Date(2025, 4, 30, 10, 15),
      status: 'draft',
      engagement: { estimated: 'High', score: 91 },
      platform: 'linkedin'
    },
    {
      id: 4,
      title: '📈 Market Insights',
      content: 'Analyse des tendances tech pour le Q2 2025...',
      date: new Date(2025, 5, 2, 8, 45),
      status: 'scheduled',
      engagement: { estimated: 'Medium', score: 68 },
      platform: 'linkedin'
    }
  ];

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Commencer au lundi de la semaine contenant le premier jour
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getPostsForDate = (date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.date);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-orange-500';
      case 'published': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const PostCard = ({ post, compact = false }) => (
    <div
      className={`group relative bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all cursor-pointer ${
        compact ? 'mb-2' : 'mb-3'
      }`}
      onClick={() => setSelectedPost(post)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`}></div>
            <span className="text-xs font-medium text-gray-500">
              {post.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h4 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {post.title}
          </h4>
          {!compact && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {post.content}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEngagementColor(post.engagement.score)}`}></div>
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const CalendarDay = ({ date }) => {
    const posts = getPostsForDate(date);
    const isCurrentMonth = isSameMonth(date);
    const isTodayDate = isToday(date);
    
    return (
      <div
        className={`min-h-32 p-2 border border-gray-100 transition-all hover:bg-gray-50 cursor-pointer ${
          !isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
        } ${isTodayDate ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
        onClick={() => setSelectedDate(date)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            isTodayDate ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {date.getDate()}
          </span>
          {posts.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {posts.length}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          {posts.slice(0, 3).map(post => (
            <PostCard key={post.id} post={post} compact={true} />
          ))}
          {posts.length > 3 && (
            <div className="text-xs text-gray-500 text-center py-1">
              +{posts.length - 3} autres
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-gray-600">Planifiez et gérez vos publications LinkedIn</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
            <Filter className="w-4 h-4" />
            <span>Filtrer</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau post</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Calendar Main */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {['month', 'week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    viewMode === mode
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px border border-gray-200 rounded-lg overflow-hidden">
            {getCalendarDays().map((date, index) => (
              <CalendarDay key={index} date={date} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Statistiques rapides</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Posts programmés</span>
                </div>
                <span className="font-semibold text-gray-900">7</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Brouillons</span>
                </div>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Publiés ce mois</span>
                </div>
                <span className="font-semibold text-gray-900">15</span>
              </div>
            </div>
          </div>

          {/* Optimal Times */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Moments optimaux</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-green-900">Mardi 9h</span>
                  <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                    +34%
                  </span>
                </div>
                <p className="text-xs text-green-700">Meilleur engagement</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-900">Jeudi 14h</span>
                  <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                    +28%
                  </span>
                </div>
                <p className="text-xs text-blue-700">Bon pour le reach</p>
              </div>
            </div>
          </div>

          {/* Content Ideas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Idées de contenu</h3>
            </div>
            
            <div className="space-y-3">
              {[
                '🚀 Tendances IA 2025',
                '💡 Leadership tips',
                '📈 Success story',
                '🎯 Industry insights'
              ].map((idea, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <span className="text-sm text-gray-900">{idea}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Posts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Prochaines publications</h3>
            
            <div className="space-y-3">
              {scheduledPosts.slice(0, 3).map(post => (
                <div key={post.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {post.date.toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short' 
                      })} à {post.date.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`}></div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {post.title}
                  </p>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir tous les posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar;