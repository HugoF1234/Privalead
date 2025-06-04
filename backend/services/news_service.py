import requests
import os
from datetime import datetime, timedelta
import logging
import json
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class NewsService:
    """Service pour récupérer les actualités via NewsAPI"""
    
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        self.base_url = "https://newsapi.org/v2"
        
        if not self.api_key:
            logger.warning("NEWS_API_KEY non configurée, mode simulation activé")
            self.simulation_mode = True
        else:
            self.simulation_mode = False
            logger.info("✅ NewsAPI configuré")
    
    def search_news(
        self, 
        keyword: str, 
        language: str = "fr", 
        days: int = 30,
        page_size: int = 20
    ) -> Dict:
        """
        Rechercher des actualités par mot-clé
        
        Args:
            keyword: Mot-clé de recherche
            language: Langue des articles
            days: Nombre de jours à couvrir
            page_size: Nombre d'articles à retourner
            
        Returns:
            Dict contenant les articles et métadonnées
        """
        if self.simulation_mode:
            return self._get_simulated_news(keyword, language)
        
        try:
            date_from = (datetime.utcnow() - timedelta(days=days)).strftime('%Y-%m-%d')
            
            params = {
                'q': keyword,
                'from': date_from,
                'sortBy': 'relevancy',
                'language': language,
                'apiKey': self.api_key,
                'pageSize': min(page_size, 100)  # Limite API
            }
            
            logger.info(f"🔍 Recherche actualités: {keyword} ({language})")
            
            response = requests.get(
                f"{self.base_url}/everything",
                params=params,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                articles = self._format_articles(data.get('articles', []))
                
                return {
                    'success': True,
                    'articles': articles,
                    'total_results': data.get('totalResults', 0),
                    'keyword': keyword,
                    'language': language
                }
            else:
                logger.error(f"Erreur NewsAPI: {response.status_code}")
                return self._get_simulated_news(keyword, language)
                
        except Exception as e:
            logger.error(f"Erreur recherche actualités: {e}")
            return self._get_simulated_news(keyword, language)
    
    def get_trending_news(
        self, 
        industry: str = "business", 
        language: str = "fr",
        page_size: int = 15
    ) -> Dict:
        """
        Récupérer les actualités tendance
        
        Args:
            industry: Secteur d'activité
            language: Langue des articles
            page_size: Nombre d'articles
            
        Returns:
            Dict contenant les articles tendance
        """
        if self.simulation_mode:
            return self._get_simulated_trending(industry, language)
        
        try:
            # Mapper les industries vers les catégories NewsAPI
            category_mapping = {
                'tech': 'technology',
                'finance': 'business',
                'health': 'health',
                'marketing': 'business',
                'general': 'business'
            }
            
            category = category_mapping.get(industry, 'business')
            
            params = {
                'category': category,
                'language': language,
                'apiKey': self.api_key,
                'pageSize': min(page_size, 100)
            }
            
            # Pour les pays francophones
            if language == 'fr':
                params['country'] = 'fr'
            
            logger.info(f"📰 Récupération actualités tendance: {category} ({language})")
            
            response = requests.get(
                f"{self.base_url}/top-headlines",
                params=params,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                articles = self._format_articles(data.get('articles', []))
                
                return {
                    'success': True,
                    'articles': articles,
                    'total_results': data.get('totalResults', 0),
                    'category': category,
                    'language': language
                }
            else:
                logger.error(f"Erreur NewsAPI trending: {response.status_code}")
                return self._get_simulated_trending(industry, language)
                
        except Exception as e:
            logger.error(f"Erreur actualités tendance: {e}")
            return self._get_simulated_trending(industry, language)
    
    def get_industry_news(
        self, 
        industry: str, 
        language: str = "fr",
        days: int = 7
    ) -> Dict:
        """
        Récupérer les actualités spécifiques à un secteur
        
        Args:
            industry: Secteur d'activité
            language: Langue des articles  
            days: Nombre de jours à couvrir
            
        Returns:
            Dict contenant les articles du secteur
        """
        # Mapping des secteurs vers des mots-clés de recherche
        industry_keywords = {
            'tech': 'technologie OR informatique OR numérique OR startup OR IA',
            'marketing': 'marketing OR publicité OR communication OR digital',
            'finance': 'finance OR économie OR banque OR investissement OR fintech',
            'health': 'santé OR médecine OR bien-être OR pharmaceutique OR biotechnologie',
            'education': 'éducation OR formation OR enseignement OR université OR edtech',
            'rh': 'ressources humaines OR emploi OR recrutement OR travail OR RH',
            'consulting': 'conseil OR consulting OR stratégie OR management OR transformation',
            'retail': 'commerce OR distribution OR vente OR e-commerce OR retail'
        }
        
        keywords = industry_keywords.get(industry, industry)
        
        return self.search_news(
            keyword=keywords,
            language=language,
            days=days,
            page_size=15
        )
    
    def _format_articles(self, articles: List[Dict]) -> List[Dict]:
        """Formater les articles pour l'interface"""
        formatted_articles = []
        
        for article in articles:
            if not article.get('title') or not article.get('description'):
                continue
            
            # Nettoyer et formater
            formatted_article = {
                'title': self._clean_text(article.get('title', '')),
                'description': self._clean_text(article.get('description', '')),
                'url': article.get('url', ''),
                'source': {
                    'name': article.get('source', {}).get('name', 'Source inconnue')
                },
                'publishedAt': article.get('publishedAt', ''),
                'urlToImage': article.get('urlToImage'),
                'content': self._clean_text(article.get('content', '')[:200]) if article.get('content') else '',
                'formatted_date': self._format_date(article.get('publishedAt'))
            }
            
            formatted_articles.append(formatted_article)
        
        return formatted_articles
    
    def _clean_text(self, text: str) -> str:
        """Nettoyer le texte des articles"""
        if not text:
            return ""
        
        # Supprimer les balises HTML basiques
        import re
        text = re.sub(r'<[^>]+>', '', text)
        
        # Décoder les entités HTML
        import html
        text = html.unescape(text)
        
        # Nettoyer les espaces multiples
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _format_date(self, date_string: str) -> str:
        """Formater la date pour l'affichage"""
        if not date_string:
            return 'Date inconnue'
        
        try:
            date_obj = datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%SZ')
            return date_obj.strftime('%d/%m/%Y')
        except:
            return 'Date inconnue'
    
    def _get_simulated_news(self, keyword: str, language: str) -> Dict:
        """Générer des actualités simulées pour la démo"""
        logger.info(f"📰 Génération actualités simulées: {keyword}")
        
        simulated_articles = [
            {
                'title': f'L\'impact de {keyword} sur l\'économie numérique en 2025',
                'description': f'Une analyse approfondie des transformations liées à {keyword} et leurs implications pour les entreprises françaises.',
                'url': 'https://example.com/article1',
                'source': {'name': 'Tech & Innovation'},
                'publishedAt': (datetime.utcnow() - timedelta(hours=2)).isoformat() + 'Z',
                'urlToImage': 'https://via.placeholder.com/400x200?text=Article+Image',
                'content': f'Les experts s\'accordent sur l\'importance croissante de {keyword} dans le paysage technologique...',
                'formatted_date': datetime.now().strftime('%d/%m/%Y')
            },
            {
                'title': f'Comment {keyword} révolutionne les pratiques professionnelles',
                'description': f'Témoignages et retours d\'expérience sur l\'adoption de {keyword} dans différents secteurs d\'activité.',
                'url': 'https://example.com/article2',
                'source': {'name': 'Business Magazine'},
                'publishedAt': (datetime.utcnow() - timedelta(hours=6)).isoformat() + 'Z',
                'urlToImage': 'https://via.placeholder.com/400x200?text=Business+News',
                'content': f'De nombreuses entreprises témoignent des bénéfices de {keyword} sur leur productivité...',
                'formatted_date': datetime.now().strftime('%d/%m/%Y')
            },
            {
                'title': f'Les enjeux de {keyword} pour les startups françaises',
                'description': f'Opportunités et défis que représente {keyword} pour l\'écosystème startup français.',
                'url': 'https://example.com/article3',
                'source': {'name': 'Startup News'},
                'publishedAt': (datetime.utcnow() - timedelta(hours=12)).isoformat() + 'Z',
                'urlToImage': 'https://via.placeholder.com/400x200?text=Startup+Focus',
                'content': f'L\'écosystème startup français s\'empare de {keyword} pour innover...',
                'formatted_date': (datetime.now() - timedelta(days=1)).strftime('%d/%m/%Y')
            }
        ]
        
        return {
            'success': True,
            'articles': simulated_articles,
            'total_results': len(simulated_articles),
            'keyword': keyword,
            'language': language,
            'simulated': True
        }
    
    def _get_simulated_trending(self, industry: str, language: str) -> Dict:
        """Générer des actualités tendance simulées"""
        logger.info(f"📈 Génération trending simulé: {industry}")
        
        industry_topics = {
            'tech': [
                'Intelligence Artificielle et productivité',
                'Cybersécurité : nouvelles menaces 2025',
                'Cloud computing : migration des entreprises'
            ],
            'marketing': [
                'Marketing d\'influence : nouvelles tendances',
                'Personnalisation client avec l\'IA',
                'ROI publicité digitale en 2025'
            ],
            'finance': [
                'Fintech : révolution des paiements',
                'Cryptomonnaies et régulation européenne',
                'Investissement ESG en forte croissance'
            ],
            'general': [
                'Transformation digitale des PME',
                'Télétravail : nouveaux enjeux RH',
                'Innovation durable en entreprise'
            ]
        }
        
        topics = industry_topics.get(industry, industry_topics['general'])
        
        trending_articles = []
        for i, topic in enumerate(topics):
            article = {
                'title': topic,
                'description': f'Analyse approfondie des enjeux liés à {topic.lower()} et impact sur les entreprises.',
                'url': f'https://example.com/trending-{i+1}',
                'source': {'name': f'{industry.capitalize()} Today'},
                'publishedAt': (datetime.utcnow() - timedelta(hours=i*2)).isoformat() + 'Z',
                'urlToImage': f'https://via.placeholder.com/400x200?text={topic.replace(" ", "+")}',
                'content': f'Les dernières évolutions concernant {topic.lower()} montrent...',
                'formatted_date': datetime.now().strftime('%d/%m/%Y')
            }
            trending_articles.append(article)
        
        return {
            'success': True,
            'articles': trending_articles,
            'total_results': len(trending_articles),
            'category': industry,
            'language': language,
            'simulated': True
        }
    
    def get_article_summary(self, article_url: str) -> Dict:
        """
        Récupérer un résumé d'article (simulation)
        Dans une vraie implémentation, cela pourrait utiliser une API de scraping
        """
        return {
            'success': True,
            'summary': 'Résumé automatique de l\'article (fonctionnalité à développer)',
            'key_points': [
                'Point clé 1 de l\'article',
                'Point clé 2 de l\'article', 
                'Point clé 3 de l\'article'
            ],
            'sentiment': 'neutral',
            'simulated': True
        }
    
    def is_available(self) -> bool:
        """Vérifier si le service NewsAPI est disponible"""
        return not self.simulation_mode
    
    def get_status(self) -> Dict:
        """Obtenir le statut du service"""
        return {
            'service': 'NewsAPI',
            'available': self.is_available(),
            'simulation_mode': self.simulation_mode,
            'api_key_configured': bool(self.api_key)
        }
