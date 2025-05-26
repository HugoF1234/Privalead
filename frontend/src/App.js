import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { useApiConnection } from './hooks/useApi';
import { apiService } from './services/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

// Composant principal de l'application
const MainApp = () => {
  const { state, actions } = useAppContext();
  const { connected, loading, error, retry } = useApiConnection();
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  // Charger les données utilisateur au démarrage
  useEffect(() => {
    const loadUserData = async () => {
      if (connected) {
        try {
          const userProfile = await apiService.getUserProfile();
          setUser(userProfile);
          console.log('✅ Profil utilisateur chargé:', userProfile);
        } catch (error) {
          console.error('❌ Erreur chargement profil:', error);
        }
      }
      setAppLoading(false);
    };

    loadUserData();
  }, [connected]);

  // Composant de chargement initial
  if (loading || appLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>LinkedBoost</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>
            {loading ? 'Connexion à l\'API...' : 'Chargement de l\'application...'}
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Écran d'erreur de connexion
  if (!connected) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '40px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px'
          }}>
            ❌
          </div>
          
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem' }}>
            Connexion impossible
          </h2>
          
          <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
            Impossible de se connecter au backend Flask.
          </p>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'left',
            fontSize: '14px'
          }}>
            <strong>Erreur :</strong> {error}
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'left',
            fontSize: '14px'
          }}>
            <strong>Vérifiez que :</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Votre backend Flask tourne sur le port 5000</li>
              <li>La route /api/health est accessible</li>
              <li>CORS est configuré pour localhost:3000</li>
            </ul>
          </div>
          
          <button
            onClick={retry}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            Réessayer la connexion
          </button>
        </div>
      </div>
    );
  }

  // Fonction pour rendre la vue courante
  const renderCurrentView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return (
          <div style={{ padding: '32px' }}>
            <h1>👤 Profil - En développement</h1>
            <p>Cette section sera développée dans la prochaine étape.</p>
          </div>
        );
      case 'history':
        return (
          <div style={{ padding: '32px' }}>
            <h1>📚 Historique - En développement</h1>
            <p>Cette section sera développée dans la prochaine étape.</p>
          </div>
        );
      case 'calendar':
        return (
          <div style={{ padding: '32px' }}>
            <h1>📅 Calendrier - En développement</h1>
            <p>Cette section sera développée dans la prochaine étape.</p>
          </div>
        );
      case 'news':
        return (
          <div style={{ padding: '32px' }}>
            <h1>📰 Actualités - En développement</h1>
            <p>Cette section sera développée dans la prochaine étape.</p>
          </div>
        );
      case 'settings':
        return (
          <div style={{ padding: '32px' }}>
            <h1>⚙️ Paramètres - En développement</h1>
            <p>Cette section sera développée dans la prochaine étape.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  // Interface principale avec sidebar
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user} 
      />
      
      <main style={{
        flex: 1,
        marginLeft: '260px',
        overflow: 'auto',
        backgroundColor: '#f9fafb'
      }}>
        {renderCurrentView()}
      </main>

      {/* Badge de statut API */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(34, 197, 94, 0.9)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000
      }}>
        🟢 API Connectée
      </div>
    </div>
  );
};

// Composant racine avec Provider
function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;