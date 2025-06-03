// services/api.js - Service principal pour communiquer avec l'API Flask

// Configuration dynamique de l'URL API
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://linkedboost-backend.onrender.com/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  
  // Helper pour les requêtes avec gestion d'erreurs
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important pour les sessions Flask
      mode: 'cors', // Explicitement demander CORS
      ...options,
    };

    try {
      console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Si on ne peut pas parser la réponse JSON
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      
      // Gestion spécifique des erreurs CORS
      if (error.message.includes('NetworkError') || error.message.includes('CORS')) {
        throw new Error('Erreur de connexion. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }

  // Test de connexion avec retry
  async healthCheck() {
    try {
      return await this.request('/health');
    } catch (error) {
      console.warn('Premier test de connexion échoué, nouvelle tentative...');
      // Retry une fois après 1 seconde
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await this.request('/health');
    }
  }

  // PROFIL UTILISATEUR
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // POSTS
  async getPosts() {
    return this.request('/posts');
  }

  async getScheduledPosts() {
    return this.request('/posts/scheduled');
  }

  async generatePost(data) {
    return this.request('/posts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async publishPost(postData) {
    return this.request('/posts/publish', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // ACTUALITÉS
  async getNews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/news?${queryString}`);
  }

  // STATISTIQUES
  async getStats() {
    return this.request('/users/stats');
  }

  // AUTHENTIFICATION
  async getAuthStatus() {
    return this.request('/auth/status');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();

// Export pour debug
window.API_BASE_URL = API_BASE_URL;
console.log('🔗 API Base URL:', API_BASE_URL);
