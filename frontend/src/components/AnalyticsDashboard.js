import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Eye, Heart, MessageCircle, 
  Share, Users, Calendar, Target, Zap, BarChart3,
  ArrowUp, ArrowDown, Clock, Filter, Hash
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('impressions');
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationProgress(100), 300);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    {
      id: 'impressions',
      label: 'Impressions',
      value: '127.5K',
      change: '+23.4%',
      changeType: 'positive',
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      data: [65, 75, 85, 95, 88, 92, 100]
    },
    {
      id: 'engagement',
      label: 'Engagement',
      value: '8.2K',
      change: '+15.7%',
      changeType: 'positive',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      data: [45, 55, 65, 70, 75, 80, 85]
    },
    {
      id: 'comments',
      label: 'Commentaires',
      value: '2.1K',
      change: '+34.2%',
      changeType: 'positive',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      data: [25, 30, 45, 50, 60, 65, 70]
    },
    {
      id: 'shares',
      label: 'Partages',
      value: '947',
      change: '-5.1%',
      changeType: 'negative',
      icon: Share,
      color: 'from-purple-500 to-purple-600',
      data: [40, 42, 38, 35, 33, 30, 28]
    }
  ];

  const topPosts = [
    {
      content: '🚀 L\'avenir du travail se dessine aujourd\'hui avec l\'IA...',
      impressions: 45200,
      engagement: 2340,
      engagementRate: 5.2,
      date: '2 jours'
    },
    {
      content: '💡 3 conseils pour transformer votre équipe...',
      impressions: 38900,
      engagement: 1890,
      engagementRate: 4.9,
      date: '5 jours'
    },
    {
      content: '🎯 Comment j\'ai doublé mon réseau en 6 mois...',
      impressions: 52100,
      engagement: 2670,
      engagementRate: 5.1,
      date: '1 semaine'
    }
  ];

  const audienceData = [
    { label: 'Tech', percentage: 35, color: 'bg-blue-500' },
    { label: 'Marketing', percentage: 28, color: 'bg-green-500' },
    { label: 'Finance', percentage: 20, color: 'bg-purple-500' },
    { label: 'RH', percentage: 17, color: 'bg-orange-500' }
  ];

  const timeRanges = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '3 mois' },
    { value: '1y', label: '1 an' }
  ];

  const MiniChart = ({ data, color }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    
    return (
      <div className="flex items-end space-x-1 h-12">
        {data.map((value, index) => {
          const height = ((value - minValue) / (maxValue - minValue)) * 100;
          return (
            <div
              key={index}
              className={`w-2 bg-gradient-to-t ${color} rounded-sm opacity-80 transition-all duration-500 ease-out`}
              style={{
                height: `${height * (animationProgress / 100)}%`,
                transitionDelay: `${index * 50}ms`
              }}
            />
          );
        })}
      </div>
    );
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "#3b82f6" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              strokeDashoffset: strokeDashoffset * (1 - animationProgress / 100)
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Analysez les performances de votre contenu LinkedIn</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`group bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                selectedMetric === metric.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changeType === 'positive' ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {metric.change}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.label}</p>
              </div>
              
              <div className="mt-4">
                <MiniChart data={metric.data} color={metric.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Évolution des performances</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">Vues</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Engagement</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Clics</button>
            </div>
          </div>
          
          {/* Simplified Chart */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {[...Array(30)].map((_, i) => {
              const height = Math.random() * 100 + 20;
              return (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all cursor-pointer"
                  style={{
                    height: `${height * (animationProgress / 100)}%`,
                    transitionDelay: `${i * 20}ms`
                  }}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mt-4">
            <span>Il y a 30 jours</span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Taux d'engagement</h3>
          
          <div className="flex justify-center mb-6">
            <CircularProgress percentage={74} color="#3b82f6" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Objectif</span>
              <span className="text-sm font-medium">80%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Moyenne secteur</span>
              <span className="text-sm font-medium">65%</span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">+9% ce mois</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Posts & Audience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Performing Posts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Posts les plus performants</h3>
          
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={index} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                <p className="text-sm text-gray-900 mb-3 line-clamp-2">{post.content}</p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{post.impressions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Impressions</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{post.engagement.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Engagement</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">{post.engagementRate}%</p>
                    <p className="text-xs text-gray-500">Taux</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Publié il y a {post.date}</span>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition de l'audience</h3>
          
          <div className="space-y-6">
            {/* Sectors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Par secteur</h4>
              <div className="space-y-3">
                {audienceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-900">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                          style={{
                            width: `${item.percentage * (animationProgress / 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demographics */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Données démographiques</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">32</p>
                  <p className="text-xs text-gray-500">Âge moyen</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">64%</p>
                  <p className="text-xs text-gray-500">Hommes</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Insight IA</span>
                </div>
                <p className="text-sm text-blue-800">
                  Votre audience est principalement composée de professionnels seniors dans la tech. 
                  Publiez le mardi matin pour un engagement optimal.
                </p>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Croissance</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-900">Nouveaux followers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">+247</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-900">Portée organique</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">52.1K</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-900">Taux de clic</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">3.2%</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Insights & Recommandations</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Best Performing Time */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Meilleur timing</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mb-1">Mardi 9h</p>
            <p className="text-sm text-blue-700">+34% d'engagement vs moyenne</p>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                📊 Basé sur vos 30 derniers posts
              </p>
            </div>
          </div>

          {/* Top Hashtags */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <Hash className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Top hashtags</span>
            </div>
            <div className="space-y-2">
              {['#Leadership', '#Innovation', '#Tech'].map((tag, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">{tag}</span>
                  <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                    +{25 - index * 3}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Type Performance */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Type de contenu</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">🎯 Conseils</span>
                <span className="text-sm font-bold text-purple-600">4.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">📈 Success stories</span>
                <span className="text-sm font-bold text-purple-600">3.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">❓ Questions</span>
                <span className="text-sm font-bold text-purple-600">3.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h4 className="font-semibold text-yellow-900 mb-3">🎯 Actions recommandées</h4>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Publiez plus de contenu le mardi matin pour maximiser l'engagement</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Utilisez davantage #Leadership dans vos posts (+25% d'engagement)</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Créez plus de contenu "conseils pratiques" (meilleur taux d'engagement)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;