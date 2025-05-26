import requests
import os
import logging

logger = logging.getLogger(__name__)

class LinkedInService:
    def __init__(self, access_token):
        self.access_token = access_token
        self.base_url = "https://api.linkedin.com/v2"
        
    def publish_post(self, content, user_sub):
        """Publier un post sur LinkedIn"""
        if not self.access_token:
            return False
        
        # Extraire l'ID utilisateur LinkedIn
        user_id = user_sub.split("_")[-1] if "_" in user_sub else user_sub
        urn = f"urn:li:person:{user_id}"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        # Traiter les mentions si présentes
        processed_content, mention_entities = self._process_mentions(content)
        
        post_data = {
            "author": urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": processed_content},
                    "shareMediaCategory": "NONE",
                    "media": []
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        # Ajouter les mentions si présentes
        if mention_entities:
            post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["mentions"] = mention_entities
        
        try:
            response = requests.post(
                f"{self.base_url}/ugcPosts",
                headers=headers,
                json=post_data
            )
            
            if response.status_code == 201:
                logger.info("Post published successfully to LinkedIn")
                return True
            else:
                logger.error(f"LinkedIn API error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"LinkedIn publish error: {str(e)}")
            return False
    
    def _process_mentions(self, content):
        """Traiter les mentions dans le contenu"""
        import re
        
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
            
            # Créer l'entité de mention
            mention_entity = {
                "entity": f"urn:li:person:{linkedin_id}",
                "textRange": {
                    "start": processed_content.find(f"@[{name}]({url})"),
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
