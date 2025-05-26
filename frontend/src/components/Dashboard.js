import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/api';
import { 
  FileText, Calendar as CalendarIcon, Target, TrendingUp, 
  Sparkles, PenTool, Clock, CheckCircle, Send 
} from 'lucide-react';

const Dashboard = () => {
  const { state, actions } = useAppContext();
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données utilisateur et stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger le profil utilisateur
        const userProfile = await apiService.getUserProfile();
        setUser(userProfile);
        
        // Charger les statistiques
        const userStats = await apiService.getStats();
        setStats(userStats);
        
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const statsData = [
    { 
      label: 'Posts publiés', 
      value: stats?.totalPosts || 0, 
      icon: FileText, 
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
    },
    { 
      label: 'Posts programmés', 
      value: stats?.scheduledPosts || 0, 
      icon: CalendarIcon, 
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
    },
    { 
      label: 'Vues ce mois', 
      value: stats?.monthlyViews || '0', 
      icon: Target, 
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    { 
      label: 'Engagement', 
      value: stats?.engagementGrowth || '+0%', 
      icon: TrendingUp, 
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)'
    }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '16px', color: '#6b7280' }}>
          Chargement des données...
        </span>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header avec animation */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '8px',
            margin: 0
          }}>
            Bienvenue, {user?.firstName || 'Utilisateur'} ! 👋
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.9,
            margin: 0
          }}>
            Prêt à créer du contenu qui marque les esprits ?
          </p>
        </div>
        
        {/* Éléments décoratifs */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '128px',
          height: '128px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          marginRight: '-64px',
          marginTop: '-64px'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '96px',
          height: '96px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          marginLeft: '-48px',
          marginBottom: '-48px'
        }}></div>
      </div>

      {/* Stats avec données réelles - VERSION CORRIGÉE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>
                    {stat.value}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '4px 0 0 0'
                  }}>
                    {stat.label}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: stat.gradient,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Génération de post */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <PenTool style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '8px' }} />
          Créer un nouveau post
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Utilisez l'IA pour créer rapidement un contenu engageant pour votre audience LinkedIn.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Ex: Partagez des conseils sur le leadership..."
            style={{
              flex: '3',
              minWidth: '300px',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          <select style={{
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none'
          }}>
            <option value="professionnel">Professionnel</option>
            <option value="familier">Familier</option>
            <option value="inspirant">Inspirant</option>
            <option value="humoristique">Humoristique</option>
          </select>
          <button style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}>
            <Sparkles style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Générer
          </button>
        </div>

        <div style={{
          marginTop: '20px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '20px'
        }}>
          <button style={{
            textDecoration: 'none',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#6b7280';
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Target style={{ width: '18px', height: '18px', color: '#3b82f6', marginRight: '8px' }} />
              <span style={{ fontWeight: '500' }}>Créer un post basé sur l'actualité</span>
            </div>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Tendances simulées */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <TrendingUp style={{ width: '20px', height: '20px', color: '#f59e0b', marginRight: '8px' }} />
          Tendances de votre secteur
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {['Intelligence Artificielle', 'Remote Work', 'Développement Durable'].map((trend, index) => (
            <div key={index} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontWeight: '500', color: '#111827' }}>
                  {trend}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#059669',
                  backgroundColor: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  +{20 + index * 5}%
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Tendance émergente dans le secteur {user?.sector || 'tech'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;