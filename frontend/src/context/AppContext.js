// context/AppContext.js - Context global pour l'état de l'application

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api';

const AppContext = createContext();

const initialState = {
  user: null,
  posts: [],
  scheduledPosts: [],
  stats: null,
  selectedArticle: null,
  draft: '',
  currentView: 'dashboard',
  loading: {
    profile: false,
    posts: false,
    generation: false,
    publishing: false,
    news: false
  },
  errors: {},
  connected: false
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.key]: action.error }
      };
    
    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.key];
      return { ...state, errors: newErrors };
    
    case 'SET_USER':
      return { ...state, user: action.user };
    
    case 'SET_POSTS':
      return { ...state, posts: action.posts };
    
    case 'SET_SCHEDULED_POSTS':
      return { ...state, scheduledPosts: action.posts };
    
    case 'SET_STATS':
      return { ...state, stats: action.stats };
    
    case 'SET_SELECTED_ARTICLE':
      return { ...state, selectedArticle: action.article };
    
    case 'SET_DRAFT':
      return { ...state, draft: action.draft };
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.view };
    
    case 'SET_CONNECTED':
      return { ...state, connected: action.connected };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions = {
    setLoading: (key, value) => 
      dispatch({ type: 'SET_LOADING', key, value }),
    
    setError: (key, error) => 
      dispatch({ type: 'SET_ERROR', key, error }),
    
    clearError: (key) => 
      dispatch({ type: 'CLEAR_ERROR', key }),
    
    setCurrentView: (view) => 
      dispatch({ type: 'SET_CURRENT_VIEW', view }),

    // Test de connexion API
    testConnection: async () => {
      try {
        actions.setLoading('connection', true);
        const result = await apiService.healthCheck();
        dispatch({ type: 'SET_CONNECTED', connected: true });
        console.log('✅ API connectée:', result);
        return true;
      } catch (error) {
        dispatch({ type: 'SET_CONNECTED', connected: false });
        actions.setError('connection', error.message);
        console.error('❌ API non connectée:', error);
        return false;
      } finally {
        actions.setLoading('connection', false);
      }
    },
    
    loadUserProfile: async () => {
      try {
        actions.setLoading('profile', true);
        actions.clearError('profile');
        const user = await apiService.getUserProfile();
        dispatch({ type: 'SET_USER', user });
      } catch (error) {
        actions.setError('profile', error.message);
      } finally {
        actions.setLoading('profile', false);
      }
    },
    
    loadPosts: async () => {
      try {
        actions.setLoading('posts', true);
        actions.clearError('posts');
        const { posts } = await apiService.getPosts();
        dispatch({ type: 'SET_POSTS', posts });
      } catch (error) {
        actions.setError('posts', error.message);
      } finally {
        actions.setLoading('posts', false);
      }
    },
    
    loadStats: async () => {
      try {
        const stats = await apiService.getStats();
        dispatch({ type: 'SET_STATS', stats });
      } catch (error) {
        actions.setError('stats', error.message);
      }
    },
    
    selectArticle: (article) => {
      dispatch({ type: 'SET_SELECTED_ARTICLE', article });
    },
    
    clearSelectedArticle: () => {
      dispatch({ type: 'SET_SELECTED_ARTICLE', article: null });
    },
    
    setDraft: (draft) => {
      dispatch({ type: 'SET_DRAFT', draft });
    },
    
    clearDraft: () => {
      dispatch({ type: 'SET_DRAFT', draft: '' });
    }
  };

  // Test de connexion au démarrage
  useEffect(() => {
    actions.testConnection();
  }, []);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
