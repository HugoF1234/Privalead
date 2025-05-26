import React from 'react';

function App() {
  console.log('App component rendu');
  
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
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        LinkedBoost
      </h1>
      <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>
        Application React chargée avec succès !
      </p>
    </div>
  );
}

export default App;
