// services/api.js - Service principal pour communiquer avec l'API Flask

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  
  // Helper pour les requêtes avec gestion d'erreurs
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important pour les sessions Flask
      ...options,
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Test de connexion
  async healthCheck() {
    return this.request('/health');
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
