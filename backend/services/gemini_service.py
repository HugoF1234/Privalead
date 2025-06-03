# backend/services/gemini_service.py

import os
import logging
from typing import Dict, Any, Optional

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger(__name__)

class GeminiService:
    """Service pour la génération de contenu avec Google Gemini AI"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY non trouvée, mode simulation activé")
            self.simulation_mode = True
        elif not GEMINI_AVAILABLE:
            logger.warning("google-generativeai non installé, mode simulation activé")
            self.simulation_mode = True
        else:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-pro")
                self.simulation_mode = False
                logger.info("✅ Gemini AI initialisé avec succès")
            except Exception as e:
                logger.error(f"❌ Erreur initialisation Gemini: {e}")
                self.simulation_mode = True
    
    def generate_from_prompt(self, prompt: str, tone: str = "professionnel", sector: str = "general") -> str:
        """
        Générer un post LinkedIn à partir d'un prompt
        
        Args:
            prompt: Le sujet/prompt du post
            tone: Le ton souhaité (professionnel, familier, inspirant, etc.)
            sector: Le secteur d'activité
            
        Returns:
            str: Le post généré
        """
        if self.simulation_mode:
            return self._simulate_generation(prompt, tone, sector)
        
        try:
            extended_prompt = self._build_prompt(prompt, tone, sector)
            response = self.model.generate_content(extended_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur génération Gemini: {str(e)}")
            return self._simulate_generation(prompt, tone, sector)
    
    def generate_from_article(self, article: Dict[str, Any], tone: str = "professionnel", sector: str = "general") -> str:
        """
        Générer un post LinkedIn à partir d'un article d'actualité
        
        Args:
            article: Dictionnaire contenant les infos de l'article
            tone: Le ton souhaité
            sector: Le secteur d'activité
            
        Returns:
            str: Le post généré
        """
        if self.simulation_mode:
            return self._simulate_article_generation(article, tone, sector)
        
        try:
            article_prompt = self._build_article_prompt(article, tone, sector)
            response = self.model.generate_content(article_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur génération article Gemini: {str(e)}")
            return self._simulate_article_generation(article, tone, sector)
    
    def _build_prompt(self, prompt: str, tone: str, sector: str) -> str:
        """Construire le prompt optimisé pour Gemini"""
        tone_instructions = {
            "professionnel": "Adoptez un ton professionnel et expert, utilisez un vocabulaire technique approprié",
            "familier": "Utilisez un ton décontracté et accessible, comme une conversation entre collègues",
            "inspirant": "Soyez motivant et positif, encouragez l'action et le dépassement",
            "humoristique": "Ajoutez une touche d'humour appropriée au contexte professionnel",
            "factuel": "Restez factuel et objectif, présentez les informations de manière claire"
        }
        
        return f"""
Rédige un post LinkedIn engageant sur le sujet : "{prompt}"

Instructions:
- Ton: {tone_instructions.get(tone, tone_instructions['professionnel'])}
- Secteur d'expertise: {sector}
- Longueur: entre 150-300 mots
- Structure: accroche, développement, call-to-action
- Inclure 2-3 hashtags pertinents
- Format adapté à LinkedIn
- Éviter les clichés, être authentique et apporter de la valeur

Le post doit susciter l'engagement et refléter une expertise dans le domaine.
"""
    
    def _build_article_prompt(self, article: Dict[str, Any], tone: str, sector: str) -> str:
        """Construire le prompt pour la génération basée sur un article"""
        tone_instructions = {
            "professionnel": "analyse professionnelle et expertise",
            "familier": "commentaire accessible et personnel", 
            "inspirant": "réflexion motivante et vision d'avenir",
            "humoristique": "perspective avec une pointe d'humour",
            "factuel": "analyse objective et factuelle"
        }
        
        return f"""
Rédige un post LinkedIn sur l'actualité suivante:

Titre: {article.get('title', '')}
Description: {article.get('description', '')}
Source: {article.get('source', {}).get('name', '')}

Instructions:
- Donnez votre {tone_instructions.get(tone, 'analyse')} sur cette actualité
- Ton: {tone}
- Secteur d'expertise: {sector}
- Apportez votre point de vue personnel et professionnel
- Posez une question à la fin pour engager la communauté
- Inclure 2-3 hashtags pertinents
- Longueur: 150-300 mots
- Format adapté à LinkedIn

Le post doit démontrer votre expertise et susciter la discussion.
"""
    
    def _simulate_generation(self, prompt: str, tone: str, sector: str) -> str:
        """Mode simulation pour les tests et développement"""
        logger.info(f"🤖 Simulation génération: {prompt[:50]}... (ton: {tone})")
        
        # Templates selon le tone
        if tone == "inspirant":
            return f"""✨ {prompt} - Une réflexion qui m'inspire aujourd'hui.

Dans notre monde en constante évolution, il est essentiel de garder une longueur d'avance.

Mes 3 clés pour réussir :
🎯 Vision claire et objectifs définis
🚀 Action constante, même par petits pas
🤝 Collaboration et partage d'expériences

L'innovation naît souvent de la simplicité et de l'audace.

Et vous, quelle est votre approche pour transformer les défis en opportunités ?

#Innovation #Leadership #{sector.capitalize()}"""
        
        elif tone == "professionnel":
            return f"""📊 Analyse : {prompt}

D'après mon expérience dans le secteur {sector}, voici les enjeux clés :

• Adaptation aux nouvelles technologies
• Optimisation des processus existants  
• Développement des compétences équipes
• Mesure de l'impact et ROI

La réussite réside dans l'équilibre entre innovation et pragmatisme.

Quelles sont vos meilleures pratiques dans ce domaine ?

#Stratégie #Performance #{sector.capitalize()}"""
        
        else:  # tone familier ou autre
            return f"""💭 Réflexion du jour : {prompt}

Je me posais cette question récemment, et voici ce que j'en pense...

Dans notre quotidien professionnel, on oublie parfois l'essentiel :
✅ Prendre le temps de la réflexion
✅ Échanger avec ses pairs
✅ Tester et itérer rapidement

Parfois, les meilleures idées viennent des conversations les plus simples.

Et vous, comment abordez-vous ce sujet ? 🤔

#Réflexion #Partage #{sector.capitalize()}"""
    
    def _simulate_article_generation(self, article: Dict[str, Any], tone: str, sector: str) -> str:
        """Simulation pour génération basée sur article"""
        title = article.get('title', 'Actualité intéressante')
        source = article.get('source', {}).get('name', 'Source')
        
        return f"""📰 Vu dans {source} : {title}

Cette actualité soulève des questions importantes pour notre secteur.

Mon analyse :
🔍 Impact potentiel sur les pratiques actuelles
⚡ Opportunités d'innovation à saisir
🎯 Adaptations nécessaires pour rester compétitif

L'évolution de notre industrie nous pousse à repenser nos approches.

Qu'en pensez-vous ? Comment cette actualité influence-t-elle votre vision ?

#Actualité #Innovation #{sector.capitalize()}"""

    def is_available(self) -> bool:
        """Vérifier si le service Gemini est disponible"""
        return not self.simulation_mode
    
    def get_status(self) -> Dict[str, Any]:
        """Obtenir le statut du service"""
        return {
            'service': 'Gemini AI',
            'available': self.is_available(),
            'simulation_mode': self.simulation_mode,
            'api_key_configured': bool(self.api_key),
            'model': 'gemini-1.5-pro' if self.model else None
        }