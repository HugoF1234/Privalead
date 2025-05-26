import google.generativeai as genai
import os
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-pro")
    
    def generate_from_prompt(self, prompt, tone="professionnel", sector="general"):
        """Générer un post à partir d'un prompt"""
        extended_prompt = f"""
        Écris un post LinkedIn sur : {prompt}
        
        Instructions:
        - Ton: {tone}
        - Secteur d'expertise: {sector}
        - Le post doit être personnel et engageant
        - Inclus 2-3 hashtags pertinents
        - Maximum 500 caractères
        - Format adapté à LinkedIn
        - Évite les clichés et sois authentique
        """
        
        try:
            response = self.model.generate_content(extended_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini generation error: {str(e)}")
            raise
    
    def generate_from_article(self, article, tone="professionnel", sector="general"):
        """Générer un post à partir d'un article d'actualité"""
        extended_prompt = f"""
        Rédige un post LinkedIn sur l'actualité suivante:
        
        Titre: {article.get('title')}
        Description: {article.get('description')}
        Source: {article.get('source')}
        
        Instructions:
        - Ton: {tone}
        - Secteur d'expertise: {sector}
        - Donne ton analyse personnelle sur cette actualité
        - Pose une question à la fin pour engager
        - Inclus 2-3 hashtags pertinents
        - Maximum 500 caractères
        - Format adapté à LinkedIn
        - Sois authentique et apporte de la valeur
        """
        
        try:
            response = self.model.generate_content(extended_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini article generation error: {str(e)}")
            raise
