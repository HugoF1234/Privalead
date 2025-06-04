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
    
    def generate_linkedin_post(
        self, 
        prompt: str, 
        tone: str = "professionnel", 
        industry: str = "general",
        user_context: dict = None,
        article_context: dict = None
    ) -> str:
        """
        Générer un post LinkedIn optimisé
        
        Args:
            prompt: Le sujet/prompt du post
            tone: Le ton souhaité
            industry: Le secteur d'activité
            user_context: Contexte utilisateur (nom, titre, etc.)
            article_context: Article source si applicable
            
        Returns:
            str: Le post généré
        """
        if self.simulation_mode:
            return self._simulate_linkedin_generation(prompt, tone, industry, user_context, article_context)
        
        try:
            linkedin_prompt = self._build_linkedin_prompt(prompt, tone, industry, user_context, article_context)
            response = self.model.generate_content(linkedin_prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur génération Gemini: {str(e)}")
            return self._simulate_linkedin_generation(prompt, tone, industry, user_context, article_context)
    
    def _build_linkedin_prompt(
        self, 
        prompt: str, 
        tone: str, 
        industry: str,
        user_context: dict = None,
        article_context: dict = None
    ) -> str:
        """Construire le prompt optimisé pour LinkedIn"""
        
        # Instructions de ton
        tone_instructions = {
            "professionnel": {
                "style": "Adoptez un ton professionnel et expert, utilisez un vocabulaire précis et crédible",
                "voice": "Position d'autorité dans votre domaine",
                "approach": "Analytique et factuel avec des insights pratiques"
            },
            "inspirant": {
                "style": "Soyez motivant et positif, encouragez l'action et le dépassement",
                "voice": "Leader visionnaire qui inspire",
                "approach": "Optimiste avec une vision d'avenir"
            },
            "familier": {
                "style": "Utilisez un ton conversationnel et accessible, comme une discussion entre collègues",
                "voice": "Approchable et authentique",
                "approach": "Personnel et relatable"
            },
            "expert": {
                "style": "Démontrez votre expertise technique avec des détails précis",
                "voice": "Autorité reconnue dans le domaine",
                "approach": "Technique mais accessible"
            },
            "storytelling": {
                "style": "Racontez une histoire engageante avec des éléments narratifs",
                "voice": "Narrateur captivant",
                "approach": "Émotionnel et mémorable"
            }
        }
        
        tone_config = tone_instructions.get(tone, tone_instructions["professionnel"])
        
        # Contexte utilisateur
        user_info = ""
        if user_context:
            user_info = f"""
Contexte utilisateur:
- Nom: {user_context.get('name', 'Professionnel')}
- Secteur: {industry}
- Titre: {user_context.get('headline', f'Expert en {industry}')}
"""
        
        # Contexte article
        article_info = ""
        if article_context:
            article_info = f"""
Article source:
- Titre: {article_context.get('title', '')}
- Description: {article_context.get('description', '')}
- Source: {article_context.get('source', {}).get('name', '')}

Instructions: Créez un post qui commente cet article avec votre expertise personnelle.
"""
        
        # Prompt principal
        main_prompt = f"""
Vous êtes un expert en création de contenu LinkedIn. Créez un post viral et engageant.

{user_info}

SUJET: {prompt}

{article_info}

INSTRUCTIONS DE TON:
- Style: {tone_config['style']}
- Voix: {tone_config['voice']}
- Approche: {tone_config['approach']}

STRUCTURE LINKEDIN OBLIGATOIRE:
1. 🎯 HOOK (1-2 lignes): Accroche qui arrête le scroll
2. 📝 DÉVELOPPEMENT (3-4 paragraphes courts): 
   - Contexte ou histoire
   - Insight principal
   - Exemple concret ou données
   - Leçon/conseil actionnable
3. 💭 ENGAGEMENT (1-2 lignes): Question directe qui invite aux commentaires
4. 🏷️ HASHTAGS (3-5): Pertinents et populaires

RÈGLES STRICTES:
✅ Longueur: 800-1300 caractères maximum
✅ Paragraphes de 1-2 lignes avec espaces entre eux
✅ Utiliser des émojis stratégiques (2-4 maximum)
✅ Éviter le jargon, rester accessible
✅ Inclure des chiffres ou statistiques si possible
✅ Créer de la valeur ajoutée authentique
✅ Finir par une question engageante
✅ Hashtags pertinents pour {industry}

INTERDICTIONS:
❌ Pas de liens externes
❌ Pas de langage marketing agressif
❌ Pas de clichés LinkedIn
❌ Pas de promesses exagérées

Commencez directement par l'accroche, sans titre ni introduction.
"""
        
        return main_prompt
    
    def _simulate_linkedin_generation(
        self, 
        prompt: str, 
        tone: str, 
        industry: str,
        user_context: dict = None,
        article_context: dict = None
    ) -> str:
        """Mode simulation pour les tests et développement"""
        logger.info(f"🤖 Simulation génération LinkedIn: {prompt[:50]}... (ton: {tone})")
        
        user_name = user_context.get('name', 'Expert') if user_context else 'Expert'
        
        if tone == "inspirant":
            return f"""🚀 {prompt}

Hier, je réfléchissais à cette question et voici ce qui m'a frappé...

Dans notre secteur {industry}, nous avons tendance à nous concentrer sur la technique. Mais la vraie transformation vient de l'humain.

Mes 3 apprentissages clés :
✨ L'innovation naît de la curiosité, pas de la pression
🤝 Les meilleures idées émergent des conversations inattendues  
📈 Le succès se mesure à l'impact, pas aux métriques

Et vous, quelle est votre vision pour transformer notre industrie ?

#Innovation #Leadership #{industry.capitalize()} #Transformation #Impact"""
        
        elif tone == "professionnel":
            return f"""📊 Analyse : {prompt}

D'après mon expérience de 10 ans dans le {industry}, voici les enjeux critiques que nous devons adresser.

Les données montrent une évolution majeure :
• 78% des entreprises investissent dans cette direction
• ROI moyen de +45% sur 18 mois
• Transformation des processus existants nécessaire

La clé du succès ? Une approche méthodique qui allie innovation et pragmatisme.

Quel est votre retour d'expérience sur ce sujet ?

#Stratégie #Performance #{industry.capitalize()} #ROI #Innovation"""
        
        elif tone == "storytelling":
            return f"""📖 {prompt}

Il y a 3 ans, j'ai vécu une situation qui a changé ma perspective...

Nous étions face à un défi majeur dans notre projet. L'équipe était découragée, les délais serrés. 

C'est là que j'ai compris une vérité fondamentale : les obstacles ne sont pas des murs, mais des tremplins.

Le résultat ? Non seulement nous avons livré à temps, mais nous avons créé une solution qui dépasse nos attentes initiales.

Avez-vous déjà vécu un moment où l'échec s'est transformé en opportunité ?

#Résilience #Leadership #{industry.capitalize()} #SuccessStory #Apprentissage"""
        
        else:  # familier ou autre
            return f"""💭 {prompt}

Je me posais cette question ce matin en prenant mon café ☕

Dans notre quotidien de {industry}, on oublie parfois l'essentiel :
🎯 Prendre du recul pour voir le big picture
🤝 Écouter vraiment ce que nous disent nos équipes
⚡ Tester rapidement plutôt que de planifier à l'infini

Parfois, les meilleures solutions viennent des conversations les plus simples.

Et vous, comment abordez-vous ce défi au quotidien ?

#Réflexion #Partage #{industry.capitalize()} #Quotidien #Simplicité"""
    
    def generate_hashtags(self, content: str, industry: str) -> list:
        """Générer des hashtags pertinents pour un contenu"""
        if self.simulation_mode:
            return self._simulate_hashtags(content, industry)
        
        try:
            hashtag_prompt = f"""
Analysez ce contenu LinkedIn et générez 5-7 hashtags pertinents :

Contenu: {content[:200]}...
Secteur: {industry}

Règles:
- Hashtags populaires sur LinkedIn
- Mélange de hashtags génériques et spécifiques au secteur
- Éviter les hashtags trop longs
- Privilégier l'engagement et la portée

Format: liste de hashtags séparés par des virgules, sans le #
"""
            response = self.model.generate_content(hashtag_prompt)
            hashtags = [f"#{tag.strip()}" for tag in response.text.strip().split(',')]
            return hashtags[:7]  # Limiter à 7 hashtags
        except Exception as e:
            logger.error(f"Erreur génération hashtags: {e}")
            return self._simulate_hashtags(content, industry)
    
    def _simulate_hashtags(self, content: str, industry: str) -> list:
        """Simulation de génération de hashtags"""
        base_tags = ['LinkedIn', 'Professionnel', 'Carriere', 'Leadership']
        
        industry_tags = {
            'tech': ['Tech', 'Innovation', 'IA', 'Numerique', 'Startups'],
            'marketing': ['Marketing', 'DigitalMarketing', 'Strategie', 'Croissance'],
            'finance': ['Finance', 'Investissement', 'Economie', 'Fintech'],
            'rh': ['RH', 'Recrutement', 'Talents', 'Management'],
            'consulting': ['Conseil', 'Strategie', 'Transformation', 'Performance']
        }
        
        specific_tags = industry_tags.get(industry, ['Business', 'Entreprise'])
        
        # Combiner et retourner
        all_tags = base_tags + specific_tags
        return [f"#{tag}" for tag in all_tags[:6]]
    
    def optimize_posting_time(self, industry: str, user_timezone: str = 'Europe/Paris') -> dict:
        """Suggérer le meilleur moment pour publier"""
        # Simulation des meilleurs moments par industrie
        optimal_times = {
            'tech': {
                'days': ['tuesday', 'wednesday', 'thursday'],
                'hours': [9, 14, 17],
                'best': 'tuesday_09:00'
            },
            'marketing': {
                'days': ['monday', 'tuesday', 'wednesday'],
                'hours': [8, 13, 16],
                'best': 'tuesday_13:00'
            },
            'finance': {
                'days': ['tuesday', 'wednesday', 'thursday'],
                'hours': [8, 12, 15],
                'best': 'wednesday_08:00'
            },
            'default': {
                'days': ['tuesday', 'wednesday'],
                'hours': [9, 14],
                'best': 'tuesday_09:00'
            }
        }
        
        timing = optimal_times.get(industry, optimal_times['default'])
        
        return {
            'recommendedDays': timing['days'],
            'recommendedHours': timing['hours'],
            'bestTime': timing['best'],
            'timezone': user_timezone,
            'engagementBoost': '+34%',
            'reason': f'Basé sur l\'activité de votre audience {industry}'
        }
    
    def analyze_content_performance(self, content: str) -> dict:
        """Analyser le potentiel de performance d'un contenu"""
        # Simulation d'analyse de contenu
        score = 75  # Score par défaut
        
        # Facteurs d'engagement
        factors = {
            'hasQuestion': '?' in content,
            'hasEmojis': any(char in content for char in '🚀💡📈✨🎯'),
            'hasHashtags': '#' in content,
            'optimalLength': 800 <= len(content) <= 1300,
            'hasNumbers': any(char.isdigit() for char in content),
            'hasCallToAction': any(word in content.lower() for word in ['pensez', 'partagez', 'commentez', 'réagissez'])
        }
        
        # Calculer le score
        positive_factors = sum(factors.values())
        score = min(95, 60 + (positive_factors * 6))
        
        # Prédictions
        estimated_reach = max(500, score * 50)
        estimated_engagement = max(20, int(estimated_reach * 0.05))
        
        return {
            'score': score,
            'level': 'High' if score >= 80 else 'Medium' if score >= 60 else 'Low',
            'estimatedReach': estimated_reach,
            'estimatedEngagement': estimated_engagement,
            'factors': factors,
            'suggestions': self._generate_suggestions(factors)
        }
    
    def _generate_suggestions(self, factors: dict) -> list:
        """Générer des suggestions d'amélioration"""
        suggestions = []
        
        if not factors['hasQuestion']:
            suggestions.append("Ajoutez une question à la fin pour encourager les commentaires")
        
        if not factors['hasEmojis']:
            suggestions.append("Utilisez 2-3 émojis pour rendre le post plus engageant")
        
        if not factors['hasHashtags']:
            suggestions.append("Ajoutez 3-5 hashtags pertinents pour améliorer la portée")
        
        if not factors['optimalLength']:
            suggestions.append("Ajustez la longueur entre 800-1300 caractères pour un engagement optimal")
        
        if not factors['hasNumbers']:
            suggestions.append("Incluez des chiffres ou statistiques pour plus de crédibilité")
        
        return suggestions[:3]  # Limiter à 3 suggestions
    
    def is_available(self) -> bool:
        """Vérifier si le service Gemini est disponible"""
        return not self.simulation_mode
    
    def get_status(self) -> dict:
        """Obtenir le statut du service"""
        return {
            'service': 'Gemini AI',
            'available': self.is_available(),
            'simulation_mode': self.simulation_mode,
            'api_key_configured': bool(self.api_key),
            'model': 'gemini-1.5-pro' if self.model else None
        }
