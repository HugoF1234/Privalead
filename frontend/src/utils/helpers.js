// utils/helpers.js - Fonctions utilitaires

export const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('fr-FR'),
    time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    datetime: date.toISOString().slice(0, 16), // Pour les inputs datetime-local
    relative: getRelativeTime(date)
  };
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = date - now;
  
  if (diff < 0) return 'Passé';
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Dans ${hours}h`;
  if (minutes > 0) return `Dans ${minutes}min`;
  return 'Maintenant';
};

export const extractHashtags = (text) => {
  if (!text) return [];
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};

export const handleApiError = (error, defaultMessage = 'Une erreur est survenue') => {
  console.error('API Error:', error);
  
  if (error.message && error.message.includes('401')) {
    return 'Non authentifié - Veuillez vous reconnecter';
  }
  
  if (error.message && error.message.includes('500')) {
    return 'Erreur serveur - Veuillez réessayer plus tard';
  }
  
  return error.message || defaultMessage;
};
