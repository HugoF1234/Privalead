import requests
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        if not self.api_key:
            raise ValueError("NEWS_API_KEY environment variable is required")
        
        self.base_url = "https://newsapi.org/v2"
    
    def search_by_keyword(self, keyword, language="fr", days=30):
        """Rechercher des actualités par mot-clé"""
        date_from = (datetime.utcnow() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        params = {
            'q': keyword,
            'from': date_from,
            'sortBy': 'relevancy',
            'language': language,
            'apiKey': self.api_key,
            'pageSize': 50
        }
        
        try:
            response = requests.get(f"{self.base_url}/everything", params=params)
            response.raise_for_status()
            
            data = response.json()
            articles = data.get('articles', [])
            
            return self._format_articles(articles)
            
        except Exception as e:
            logger.error(f"News search error: {str(e)}")
            raise
    
    def get_by_sector(self, sector, language="fr", days=30):
        """Récupérer des actualités par secteur"""
        sector_keywords = {
            'tech': 'technologie OR informatique OR numérique OR startup',
            'marketing': 'marketing OR publicité OR communication OR digital',
            'finance': 'finance OR économie OR banque OR investissement',
            'sante': 'santé OR médecine OR bien-être OR pharmaceutique',
            'education': 'éducation OR formation OR enseignement OR université',
            'rh': 'ressources humaines OR emploi OR recrutement OR travail',
            'consulting': 'conseil OR consulting OR stratégie OR management',
            'retail': 'commerce OR distribution OR vente OR e-commerce',
        }
        
        query = sector_keywords.get(sector, sector)
        return self.search_by_keyword(query, language, days)
    
    def get_trending(self, sector="general"):
        """Récupérer les actualités tendance"""
        try:
            params = {
                'country': 'fr',
                'category': 'business' if sector == 'general' else sector,
                'apiKey': self.api_key,
                'pageSize': 10
            }
            
            response = requests.get(f"{self# 📁 Structure GitHub LinkedBoost - Prête pour déploiement
