import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { useApiConnection } from './hooks/useApi';

// Composant de test de connexion
const ConnectionTest = () => {
  const { state, actions } = useAppContext();
  const { connected, loading, error, retry } = useApiConnection();

  return (
    <div style={{
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700' }}>
        LinkedBoost
      </h1>
      <p style={{ fontSize: '1.2rem', margin: '10px 0', opacity: 0.9 }}>
        Test de connexion API
      </p>

      {/* Status de connexion */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '30px',
        padding: '15px 25px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '25px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: loading ? '#fbbf24' : connected ? '#4ade80' : '#ef4444',
          borderRadius: '50%',
          marginRight: '12px',
          animation: loading ? 'pulse 2s infinite' : 'none'
        }}></div>
        <span style={{ fontWeight: '500' }}>
          {loading ? 'Test en cours...' : 
           connected ? 'Backend connecté ✅' : 
           'Backend déconnecté ❌'}
        </span>
      </div>

      {/* Détails de connexion */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Détails de connexion :</h3>
        
        <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <p><strong>URL API :</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</p>
          <p><strong>Statut :</strong> {loading ? 'En cours...' : connected ? 'Connecté' : 'Déconnecté'}</p>
          {error && (
            <p style={{ color: '#fca5a5' }}><strong>Erreur :</strong> {error}</p>
          )}
          <p><strong>Context State :</strong> {state.connected ? 'Actif' : 'Inactif'}</p>
        </div>

        {/* Bouton retry si erreur */}
        {error && (
          <button
            onClick={retry}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            Réessayer la connexion
          </button>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        fontSize: '0.85rem',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        <p><strong>Pour tester :</strong></p>
        <p>1. Assurez-vous que votre backend Flask tourne sur le port 5000</p>
        <p>2. La route /api/health doit être accessible</p>
        <p>3. CORS doit être configuré pour accepter localhost:3000</p>
      </div>

      {/* Boutons de navigation */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => actions.setCurrentView('dashboard')}
          style={{
            padding: '12px 24px',
            background: connected ? '#059669' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: connected ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
          disabled={!connected}
        >
          {connected ? 'Accéder au Dashboard' : 'Backend requis'}
        </button>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Actualiser
        </button>
      </div>
    </div>
  );
};

// Composant principal avec Provider
function App() {
  return (
    <AppProvider>
      <ConnectionTest />
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.7;
          }
        }
      `}</style>
    </AppProvider>
  );
}

export default App;
