import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
console.log('Container trouvé:', container);

if (container) {
  const root = ReactDOM.createRoot(container);
  console.log('Root créé:', root);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('App rendue');
} else {
  console.error('Container root non trouvé');
}
