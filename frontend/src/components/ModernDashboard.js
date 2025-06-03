import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Target, TrendingUp, Sparkles, 
  PenTool, Clock, CheckCircle, Send, ArrowRight,
  Zap, BarChart, Users, Heart, MessageCircle
} from 'lucide-react';

const ModernDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 24,
    scheduledPosts: 7,
    monthlyViews: '42.3K',
    engagementGrowth: '+67%'
  });
  
  const [user] = useState({
    firstName: 'Hugo',
    lastName: 'Founder',
    sector: 'tech'
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsData = [
    { 
      label: 'Posts publiés', 
      value: stats.totalPosts, 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeColor: 'text-green-500'
    },
    { 
      label: 'Posts programmés', 
      value: stats.scheduledPosts, 
      icon: Calendar, 
      color: 'from-purple-500 to-purple-600',
      change: '+8%',
      changeColor: 'text-green-500'
    },
    { 
      label: 'Vues ce mois', 
      value: stats.monthlyViews, 
      icon: Target, 
      color: 'from-green-500 to-green-600',
      change: '+23%',
      changeColor: 'text-green-500'
    },
    { 
      label: 'Engagement', 
      value: stats.engagementGrowth, 
      icon: TrendingUp, 
      color: 'from-orange-500 to-red-500',
      change: '+67%',
      changeColor: 'text-green-500'
    }
  ];

  const trendingTopics = [
    { name: 'Intelligence Artificielle', growth: '+34%', posts: 1247 },
    { name: 'Leadership', growth: '+28%', posts: 892 },
    { name: 'Innovation', growth: '+22%', posts: 634 }
  ];

  const recentPosts = [
    {
      content: '🚀 L\'avenir du travail se dessine aujourd\'hui avec l\'IA...',
      date: '2h',
      likes: 42,
      comments: 8,
      status: 'published'
    },
    {
      content: '💡 3 conseils pour transformer votre équipe...',
      date: '1j',
      likes: 67,
      comments: 12,
      status: 'published'
    },
    {
      content: '🎯 Comment j\'ai augmenté mon engagement de 300%...',
      date: 'Demain 9h',
      likes: 0,
      comments: 0,
      status: 'scheduled'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Header Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">
                Salut {user.firstName} ! 👋
              </h1>
              <p className="text-xl text-white/90">
                Prêt à créer du contenu qui inspire ?
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm">Posts ce mois</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.2K</div>
                <div className="text-sm">Vues totales</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${stat.changeColor} flex items-center`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Post Generator */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Créer un nouveau post</h2>
              <p className="text-sm text-gray-500">Laissez l'IA vous aider à créer du contenu engageant</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Décrivez votre idée de post..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <select className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                <option>Professionnel</option>
                <option>Inspirant</option>
                <option>Humoristique</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 group">
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Générer avec l'IA</span>
              </button>
              <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300">
                Depuis actualité
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <button className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Templates rapides</p>
                <p className="text-xs text-gray-500">Utilisez nos modèles</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Analyser tendances</p>
                <p className="text-xs text-gray-500">Posts performants</p>
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Tendances</h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{topic.name}</p>
                    <p className="text-xs text-gray-500">{topic.posts} posts</p>
                  </div>
                  <div className="text-green-500 font-medium text-sm">
                    {topic.growth}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Activité récente</h3>
            </div>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-gray-500">
                      <span>{post.date}</span>
                      {post.status === 'published' && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {post.status === 'published' ? 'Publié' : 'Programmé'}
                    </div>
                  </div>
                  {index < recentPosts.length - 1 && <div className="border-t border-gray-100"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: 'Planifier post', color: 'from-blue-500 to-blue-600' },
            { icon: Users, label: 'Analyser audience', color: 'from-green-500 to-green-600' },
            { icon: BarChart, label: 'Voir statistiques', color: 'from-purple-500 to-purple-600' },
            { icon: Send, label: 'Publier maintenant', color: 'from-orange-500 to-red-500' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button 
                key={index}
                className="flex flex-col items-center space-y-2 p-4 rounded-xl hover:bg-gray-50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;