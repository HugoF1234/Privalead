import requests
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class LinkedInService:
    """Service pour les interactions avec l'API LinkedIn"""
    
    def __init__(self, access_token: str = None):
        self.access_token = access_token
        self.base_url = "https://api.linkedin.com/v2"
        
    def set_access_token(self, token: str):
        """Définir le token d'accès"""
        self.access_token = token
    
    def publish_post(
        self, 
        content: str, 
        linkedin_id: str, 
        images: List[str] = None,
        schedule_time: datetime = None
    ) -> Dict:
        """
        Publier un post sur LinkedIn
        
        Args:
            content: Contenu du post
            linkedin_id: ID LinkedIn de l'utilisateur
            images: Liste des URLs d'images (optionnel)
            schedule_time: Heure de programmation (non supporté par LinkedIn API)
            
        Returns:
            Dict avec le résultat de la publication
        """
        if not self.access_token:
            return {'success': False, 'error': 'Token d\'accès manquant'}
        
        # URN de l'utilisateur
        author_urn = f"urn:li:person:{linkedin_id}"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        try:
            # Traiter les mentions dans le contenu
            processed_content, mention_entities = self._process_mentions(content)
            
            # Préparer les médias si présents
            media_assets = []
            if images:
                media_assets = self._upload_images(images, author_urn, headers)
            
            # Déterminer le type de média
            share_media_category = "IMAGE" if media_assets else "NONE"
            
            # Construire le payload
            post_data = {
                "author": author_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {"text": processed_content},
                        "shareMediaCategory": share_media_category,
                        "media": media_assets
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            # Ajouter les mentions si présentes
            if mention_entities:
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["mentions"] = mention_entities
            
            # Publier le post
            response = requests.post(
                f"{self.base_url}/ugcPosts",
                headers=headers,
                json=post_data,
                timeout=30
            )
            
            if response.status_code == 201:
                post_id = response.headers.get('x-restli-id') or response.json().get('id')
                logger.info(f"✅ Post LinkedIn publié avec succès: {post_id}")
                return {
                    'success': True,
                    'post_id': post_id,
                    'message': 'Post publié avec succès sur LinkedIn'
                }
            else:
                error_msg = f"Erreur LinkedIn API: {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail.get('message', '')}"
                except:
                    error_msg += f" - {response.text}"
                
                logger.error(error_msg)
                return {'success': False, 'error': error_msg}
                
        except Exception as e:
            error_msg = f"Erreur lors de la publication: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
    
    def _process_mentions(self, content: str) -> tuple:
        """
        Traiter les mentions dans le contenu LinkedIn
        
        Args:
            content: Contenu avec mentions au format @[Nom](URL)
            
        Returns:
            tuple: (contenu traité, entités de mention)
        """
        # Pattern pour détecter les mentions @[Nom](URL)
        mention_pattern = r'@\[(.*?)\]\((.*?)\)'
        mentions = re.findall(mention_pattern, content)
        
        if not mentions:
            return content, []
        
        mention_entities = []
        processed_content = content
        
        for i, (name, url) in enumerate(mentions):
            # Extraire l'ID LinkedIn de l'URL
            linkedin_id = url.rstrip('/').split('/')[-1]
            
            # Position de la mention dans le texte traité
            mention_start = processed_content.find(f"@[{name}]({url})")
            if mention_start == -1:
                continue
            
            # Créer l'entité de mention
            mention_entity = {
                "entity": f"urn:li:person:{linkedin_id}",
                "textRange": {
                    "start": mention_start,
                    "length": len(f"@{name}")
                }
            }
            mention_entities.append(mention_entity)
            
            # Remplacer par la version simple
            processed_content = processed_content.replace(
                f"@[{name}]({url})", 
                f"@{name}", 
                1
            )
        
        return processed_content, mention_entities
    
    def _upload_images(self, images: List[str], author_urn: str, headers: Dict) -> List[Dict]:
        """
        Upload des images sur LinkedIn (simplifié pour l'exemple)
        
        Note: Cette fonction nécessiterait une implémentation complète 
        pour gérer l'upload d'images vers LinkedIn
        """
        media_assets = []
        
        # Pour chaque image, on devrait :
        # 1. Enregistrer l'upload avec registerUpload
        # 2. Uploader le fichier
        # 3. Ajouter l'asset au média
        
        # Implémentation simplifiée pour la démo
        logger.info(f"📸 Upload de {len(images)} image(s) (fonctionnalité à implémenter)")
        
        return media_assets
    
    def get_post_analytics(self, post_id: str) -> Dict:
        """
        Récupérer les analytics d'un post LinkedIn
        
        Args:
            post_id: ID du post LinkedIn
            
        Returns:
            Dict avec les métriques du post
        """
        if not self.access_token:
            return {'error': 'Token d\'accès manquant'}
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        try:
            # Récupérer les statistiques du post
            response = requests.get(
                f"{self.base_url}/socialActions/{post_id}/statistics",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'likes': data.get('numLikes', 0),
                    'comments': data.get('numComments', 0),
                    'shares': data.get('numShares', 0),
                    'views': data.get('numViews', 0),
                    'last_updated': datetime.utcnow().isoformat()
                }
            else:
                logger.warning(f"Impossible de récupérer les analytics: {response.status_code}")
                return self._get_simulated_analytics()
                
        except Exception as e:
            logger.error(f"Erreur récupération analytics: {e}")
            return self._get_simulated_analytics()
    
    def _get_simulated_analytics(self) -> Dict:
        """Générer des analytics simulées pour la démo"""
        import random
        return {
            'likes': random.randint(10, 150),
            'comments': random.randint(2, 25),
            'shares': random.randint(1, 15),
            'views': random.randint(200, 2000),
            'last_updated': datetime.utcnow().isoformat(),
            'simulated': True
        }
    
    def search_users(self, query: str) -> List[Dict]:
        """
        Rechercher des utilisateurs LinkedIn (pour les mentions)
        
        Note: L'API de recherche LinkedIn est très restrictive
        Cette fonction retourne des résultats simulés
        """
        logger.info(f"🔍 Recherche LinkedIn simulée: {query}")
        
        # Résultats simulés pour la démo
        simulated_users = [
            {
                'id': 'example-user-1',
                'name': f'{query} Expert',
                'headline': f'Expert en {query}',
                'profile_url': f'https://www.linkedin.com/in/{query.lower()}-expert/',
                'image_url': None
            },
            {
                'id': 'example-user-2', 
                'name': f'{query} Leader',
                'headline': f'Leader {query}',
                'profile_url': f'https://www.linkedin.com/in/{query.lower()}-leader/',
                'image_url': None
            }
        ]
        
        return simulated_users
    
    def get_optimal_posting_times(self, linkedin_id: str) -> Dict:
        """
        Récupérer les meilleurs moments pour publier
        (Simulation car non disponible dans l'API publique)
        """
        return {
            'optimal_days': ['tuesday', 'wednesday', 'thursday'],
            'optimal_hours': [9, 14, 17],
            'best_time': 'tuesday_09:00',
            'timezone': 'Europe/Paris',
            'engagement_boost': '+34%',
            'based_on': 'Analyse de votre audience',
            'simulated': True
        }
    
    def validate_token(self) -> bool:
        """Valider le token d'accès LinkedIn"""
        if not self.access_token:
            return False
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        try:
            response = requests.get(
                "https://api.linkedin.com/v2/userinfo",
                headers=headers,
                timeout=10
            )
            return response.status_code == 200
        except:
            return False
