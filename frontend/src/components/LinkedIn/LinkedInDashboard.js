import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, FileText, Calendar, Target, 
  Plus, BarChart, Users, Settings, 
  Sparkles, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const LinkedInDashboard = ({ user }) => {
  const [linkedinStatus, setLinkedinStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    checkLinkedInStatus();
    if (linkedinStatus?.connected) {
      loadStats();
      loadRecentPosts();
    }
  }, []);

  const checkLinkedInStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/status', {
        credentials: 'include'
      });
      const data = await response.json();
      setLinkedinStatus(data);
    } catch (error) {
      console.error('Erreur statut LinkedIn:', error);
      setLinkedinStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/linkedin/analytics', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.overview);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const loadRecentPosts = async () => {
    try {
      const response = await fetch('/api/linkedin/posts?limit=5', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setRecentPosts(data.posts);
      }
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    }
  };

  const connectLinkedIn = () => {
    window.location.href = '/api/linkedin/auth';
  };

  const disconnectLinkedIn = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir déconnecter LinkedIn ?')) return;
    
    try {
      const response = await fetch('/api/linkedin/disconnect', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setLinkedinStatus({ connected: false });
        setStats(null);
        setRecentPosts([]);
        alert('LinkedIn déconnecté avec succès');
      }
    } catch (error) {
      console.error('Erreur déconnexion LinkedIn:', error);
      alert('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si LinkedIn n'est pas connecté
  if (!linkedinStatus?.connected) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">LinkedIn Boost</h2>
              <p className="text-blue-100">
                Connectez votre compte LinkedIn pour créer et programmer du contenu automatiquement
              </p>
            </div>
            <div className="text-6xl opacity-20">
              <i className="fab fa-linkedin"></i>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Génération IA</h3>
            <p className="text-gray-600 text-sm">
              Créez du contenu professionnel avec l'intelligence artificielle
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Programmation</h3>
            <p className="text-gray-600 text-sm">
              Planifiez vos publications aux moments optimaux
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">
              Analysez les performances de vos publications
            </p>
          </div>
        </div>

        {/* Bouton de connexion */}
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fab fa-linkedin text-2xl text-blue-600"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Connecter LinkedIn
          </h3>
          <p className="text-gray-600 mb-6">
            Autorisez Privalead à accéder à votre compte LinkedIn pour commencer
          </p>
          <button
            onClick={connectLinkedIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 mx-auto"
          >
            <i className="fab fa-linkedin"></i>
            <span>Se connecter avec LinkedIn</span>
          </button>
        </div>
      </div>
    );
  }

  // Dashboard LinkedIn connecté
  return (
    <div className="space-y-6">
      {/* Header avec statut */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">LinkedIn connecté</span>
            </div>
            <h2 className="text-2xl font-bold">
              Bonjour {linkedinStatus.user?.firstName || user?.name} !
            </h2>
            <p className="text-green-100">
              Votre compte LinkedIn est prêt pour la création de contenu
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={disconnectLinkedIn}
              className="text-white hover:text-red-200 transition-colors text-sm"
            >
              Déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            <p className="text-sm text-gray-600">Posts publiés</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {stats.scheduledPosts}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.scheduledPosts}</p>
            <p className="text-sm text-gray-600">Programmés</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +{stats.avgEngagement}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
            <p className="text-sm text-gray-600">Vues totales</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {stats.avgEngagement}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLikes + stats.totalComments}</p>
            <p className="text-sm text-gray-600">Engagement</p>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Créer un post</h3>
              <p className="text-sm text-gray-600">Génération IA instantanée</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
            Commencer
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Programmer</h3>
              <p className="text-sm text-gray-600">Planifier une publication</p>
            </div>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
            Planifier
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">Voir les performances</p>
            </div>
          </div>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors">
            Analyser
          </button>
        </div>
      </div>

      {/* Posts récents */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Publications récentes</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Voir tout
          </button>
        </div>

        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2 line-clamp-2">
                      {post.content.substring(0, 120)}...
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {post.status === 'published' 
                            ? new Date(post.publishedAt).toLocaleDateString('fr-FR')
                            : `Programmé ${new Date(post.scheduledFor).toLocaleDateString('fr-FR')}`
                          }
                        </span>
                      </span>
                      
                      {post.status === 'published' && post.analytics && (
                        <>
                          <span>{post.analytics.likes} likes</span>
                          <span>{post.analytics.comments} commentaires</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-700'
                        : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {post.status === 'published' ? 'Publié' : 
                       post.status === 'scheduled' ? 'Programmé' : 'Brouillon'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune publication pour le moment</p>
            <p className="text-sm">Créez votre premier post LinkedIn !</p>
          </div>
        )}
      </div>

      {/* Conseils et insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Insights IA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Meilleur moment</h4>
            <p className="text-sm text-gray-600">
              Mardi à 9h pour +34% d'engagement
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📈 Tendance</h4>
            <p className="text-sm text-gray-600">
              Les posts avec questions génèrent +45% de commentaires
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInDashboard;
