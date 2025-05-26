import React from 'react';
import { 
  BarChart3, User, History, Calendar, Settings, LogOut, 
  TrendingUp, Newspaper 
} from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, user }) => {
  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-blue-600' },
    { id: 'profile', icon: User, label: 'Profil', color: 'text-purple-600' },
    { id: 'history', icon: History, label: 'Historique', color: 'text-green-600' },
    { id: 'calendar', icon: Calendar, label: 'Calendrier', color: 'text-orange-600' },
    { id: 'news', icon: Newspaper, label: 'Actualités', color: 'text-red-600' },
    { id: 'settings', icon: Settings, label: 'Paramètres', color: 'text-gray-600' }
  ];

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Pour l'instant, on recharge juste la page
      window.location.reload();
    }
  };

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRight: '1px solid #e5e7eb',
      position: 'fixed',
      height: '100vh',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '24px 20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <TrendingUp style={{ width: '18px', height: '18px', color: 'white' }} />
        </div>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            LinkedBoost
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0
          }}>
            Propulsez votre LinkedIn
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav style={{
        flex: 1,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                color: isActive ? '#3b82f6' : '#374151',
                border: 'none',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon style={{
                width: '18px',
                height: '18px',
                marginRight: '12px',
                color: isActive ? '#3b82f6' : '#6b7280'
              }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'U'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontWeight: '500',
              color: '#111827',
              margin: 0,
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email || 'email@example.com'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#fef2f2';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;