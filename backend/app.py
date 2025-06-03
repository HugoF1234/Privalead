import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import logging
from routes import register_blueprints
from models import User, Post
from services import GeminiService, LinkedInService, NewsService


# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation Flask
app = Flask(__name__)

# Configuration CORS
CORS(app, 
     origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','),
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Configuration base de données
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///linkedboost_dev.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialisation extensions
db = SQLAlchemy(app)

# Modèles définis directement ici
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    sub = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120))
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    picture = db.Column(db.String(250))
    language = db.Column(db.String(10), default='fr')
    country = db.Column(db.String(10), default='FR')
    email_verified = db.Column(db.Boolean, default=False)
    secteur = db.Column(db.String(120))
    interets = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'picture': self.picture,
            'sector': self.secteur,
            'interests': self.interets or [],
            'language': self.language,
            'country': self.country,
            'emailVerified': self.email_verified
        }

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    published_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scheduled = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='draft')
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'publishedAt': self.published_at.isoformat() if self.published_at else None,
            'scheduled': self.scheduled,
            'status': self.status,
            'likes': self.likes_count,
            'comments': self.comments_count,
            'shares': self.shares_count,
            'views': self.views_count
        }

# Routes de base
@app.route('/api/health')
def health_check():
    """Route de santé pour vérifier que l'API fonctionne"""
    try:
        # Test de connexion à la base de données
        db.session.execute('SELECT 1')
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'
    
    logger.info("✅ Health check appelé - API fonctionnelle")
    
    return jsonify({
        'status': 'healthy',
        'database': db_status,
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'message': 'LinkedBoost API is running perfectly!',
        'cors': 'enabled'
    })

# Routes d'authentification
@app.route('/api/auth/status')
def auth_status():
    """Vérifier le statut d'authentification"""
    logger.info("📱 Statut d'auth demandé depuis React")
    # Pour la démo, on retourne un utilisateur connecté
    return jsonify({
        'authenticated': True,
        'user': {
            'id': 1,
            'firstName': 'Hugo',
            'lastName': 'Founder',
            'email': 'hugo@linkedboost.com',
            'sector': 'tech',
            'interests': ['IA', 'Développement', 'Innovation'],
            'picture': None,
            'language': 'fr',
            'country': 'FR'
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Déconnexion"""
    return jsonify({'message': 'Logged out successfully'})

# Routes utilisateur
@app.route('/api/users/profile')
def get_user_profile():
    """Récupérer le profil utilisateur"""
    logger.info("📱 Profile demandé depuis React")
    return jsonify({
        'id': 1,
        'firstName': 'Hugo',
        'lastName': 'Founder',
        'email': 'hugo@linkedboost.com',
        'sector': 'tech',
        'interests': ['IA', 'Développement', 'Innovation'],
        'picture': None,
        'language': 'fr',
        'country': 'FR'
    })

@app.route('/api/users/profile', methods=['PUT'])
def update_user_profile():
    """Mettre à jour le profil utilisateur"""
    data = request.get_json()
    logger.info(f"📝 Mise à jour du profil: {data}")
    
    return jsonify({
        'success': True,
        'message': 'Profil mis à jour avec succès',
        'user': {
            'id': 1,
            'firstName': 'Hugo',
            'lastName': 'Founder',
            'email': 'hugo@linkedboost.com',
            'sector': data.get('sector', 'tech'),
            'interests': data.get('interests', ['IA', 'Développement', 'Innovation']),
            'picture': None,
            'language': 'fr',
            'country': 'FR'
        }
    })

@app.route('/api/users/stats')
def get_user_stats():
    """Récupérer les statistiques utilisateur"""
    logger.info("📊 Stats demandées depuis React")
    import random
    return jsonify({
        'totalPosts': random.randint(10, 25),
        'scheduledPosts': random.randint(2, 8),
        'monthlyViews': f"{random.randint(10, 25)}.{random.randint(1, 9)}K",
        'engagementGrowth': f"+{random.randint(15, 45)}%"
    })

# Routes des posts
@app.route('/api/posts')
def get_posts():
    """Récupérer tous les posts"""
    logger.info("📝 Posts demandés depuis React")
    return jsonify({
        'posts': [
            {
                'id': 1,
                'content': '🚀 Premier post de test depuis notre nouvelle API LinkedBoost !',
                'publishedAt': '2025-01-20T10:30:00',
                'scheduled': False,
                'status': 'published',
                'likes': 25,
                'comments': 8,
                'shares': 3,
                'views': 145
            },
            {
                'id': 2,
                'content': '💡 L\'IA transforme notre façon de créer du contenu LinkedIn...',
                'publishedAt': '2025-01-19T14:15:00',
                'scheduled': False,
                'status': 'published',
                'likes': 18,
                'comments': 5,
                'shares': 2,
                'views': 98
            },
            {
                'id': 3,
                'content': '🎯 Comment j\'ai doublé mon engagement en 3 mois...',
                'publishedAt': '2025-01-18T09:45:00',
                'scheduled': False,
                'status': 'published',
                'likes': 42,
                'comments': 12,
                'shares': 7,
                'views': 234
            }
        ]
    })

@app.route('/api/posts/scheduled')
def get_scheduled_posts():
    """Récupérer les posts programmés"""
    logger.info("⏰ Posts programmés demandés depuis React")
    return jsonify({
        'scheduledPosts': [
            {
                'id': 4,
                'content': '🎯 Post programmé pour demain matin !',
                'publishedAt': '2025-06-04T08:00:00',
                'scheduled': True,
                'status': 'scheduled'
            },
            {
                'id': 5,
                'content': '📈 Analyse des tendances du marché tech pour ce trimestre',
                'publishedAt': '2025-06-05T10:30:00',
                'scheduled': True,
                'status': 'scheduled'
            }
        ]
    })

@app.route('/api/posts/generate', methods=['POST'])
def generate_post():
    """Générer un post avec l'IA"""
    data = request.get_json()
    prompt = data.get('prompt', '')
    tone = data.get('tone', 'professionnel')
    
    logger.info(f"🤖 Génération de post: {prompt[:50]}... (ton: {tone})")
    
    # Simulation de génération IA
    import time
    time.sleep(1)  # Simuler le temps de traitement
    
    # Exemples de posts générés selon le prompt
    sample_drafts = {
        'leadership': """🎯 Le leadership moderne ne se résume plus à donner des ordres.

Après 5 ans de management d'équipe, voici ce que j'ai appris :

✨ Écoutez plus que vous ne parlez
🤝 Donnez du sens avant de donner des tâches  
🚀 Célébrez les échecs autant que les succès
💡 Investissez dans les personnes, pas seulement les projets

Un leader inspire. Un manager contrôle. 
Soyez celui qui élève les autres.

Et vous, quelle leçon de leadership a transformé votre approche ?

#Leadership #Management #Innovation""",
        
        'innovation': """🚀 L'innovation ne naît pas dans les salles de réunion.

Elle émerge quand on :
• Remet en question l'évidence
• Écoute les clients "difficiles" 
• Échoue vite pour apprendre plus vite
• Connecte des idées en apparence incompatibles

Le secret ? Arrêter de chercher LA solution parfaite.
Commencer par comprendre LE problème parfaitement.

Quelle innovation vous a le plus marqué cette année ?

#Innovation #Entrepreneuriat #Tech""",
        
        'default': f"""💭 Réflexion du jour sur : {prompt}

Dans un monde en constante évolution, il est crucial de rester adaptable et d'embrasser le changement.

Voici mes 3 conseils pour naviguer dans cette transformation :

1️⃣ Cultivez une mentalité de croissance
2️⃣ Investissez dans l'apprentissage continu  
3️⃣ Construisez des relations authentiques

Et vous, comment vous adaptez-vous aux changements de votre secteur ? 💭

#Croissance #Innovation #LinkedIn"""
    }
    
    # Choisir le draft selon le prompt
    if 'leadership' in prompt.lower() or 'manager' in prompt.lower():
        draft = sample_drafts['leadership']
    elif 'innovation' in prompt.lower() or 'tech' in prompt.lower():
        draft = sample_drafts['innovation']
    else:
        draft = sample_drafts['default']
    
    return jsonify({
        'success': True,
        'draft': draft
    })

@app.route('/api/posts/publish', methods=['POST'])
def publish_post():
    """Publier ou programmer un post"""
    data = request.get_json()
    content = data.get('content', '')
    publish_time = data.get('publishTime')
    publish_now = data.get('publishNow', False)
    
    logger.info(f"📤 Publication de post: {len(content)} caractères")
    
    # Simulation de publication
    import time
    time.sleep(0.5)
    
    if publish_now:
        return jsonify({
            'success': True,
            'message': 'Post publié avec succès !',
            'post': {
                'id': 999,
                'content': content,
                'publishedAt': datetime.utcnow().isoformat(),
                'status': 'published'
            }
        })
    else:
        return jsonify({
            'success': True,
            'message': 'Post programmé avec succès !',
            'post': {
                'id': 998,
                'content': content,
                'publishedAt': publish_time,
                'status': 'scheduled'
            }
        })

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Supprimer un post"""
    logger.info(f"🗑️ Suppression du post {post_id}")
    
    return jsonify({
        'success': True,
        'message': 'Post supprimé avec succès'
    })

# Routes des actualités
@app.route('/api/news')
def get_news():
    """Récupérer les actualités"""
    keyword = request.args.get('keyword', '')
    language = request.args.get('language', 'fr')
    
    logger.info(f"📰 News demandées: keyword={keyword}, lang={language}")
    
    # Simulation d'articles d'actualité
    sample_articles = [
        {
            'id': 1,
            'title': 'L\'IA révolutionne le marketing digital',
            'description': 'Les nouvelles technologies d\'intelligence artificielle transforment la façon dont les entreprises approchent le marketing digital...',
            'source': 'TechCrunch',
            'date': '2025-06-03',
            'url': 'https://example.com/article1',
            'urlToImage': None
        },
        {
            'id': 2,
            'title': 'LinkedIn lance de nouvelles fonctionnalités pour les créateurs',
            'description': 'La plateforme professionnelle annonce des outils avancés pour aider les créateurs de contenu...',
            'source': 'Les Échos',
            'date': '2025-06-02',
            'url': 'https://example.com/article2',
            'urlToImage': None
        },
        {
            'id': 3,
            'title': 'Le télétravail redéfinit les stratégies RH',
            'description': 'Comment les entreprises adaptent leurs politiques de ressources humaines à l\'ère du travail hybride...',
            'source': 'Harvard Business Review',
            'date': '2025-06-01',
            'url': 'https://example.com/article3',
            'urlToImage': None
        }
    ]
    
    # Filtrer selon le mot-clé
    if keyword:
        filtered_articles = [
            article for article in sample_articles 
            if keyword.lower() in article['title'].lower() or keyword.lower() in article['description'].lower()
        ]
        articles = filtered_articles if filtered_articles else sample_articles[:1]
    else:
        articles = sample_articles
    
    return jsonify({
        'articles': articles
    })

@app.route('/api/news/trending')
def get_trending_news():
    """Récupérer les actualités tendance"""
    logger.info("📊 Trending news demandées")
    
    return jsonify({
        'trending': [
            {
                'id': 1,
                'title': 'Intelligence Artificielle',
                'growth': '+34%',
                'category': 'tech'
            },
            {
                'id': 2,
                'title': 'Leadership',
                'growth': '+28%',
                'category': 'management'
            },
            {
                'id': 3,
                'title': 'Innovation',
                'growth': '+22%',
                'category': 'business'
            }
        ]
    })

# Gestion d'erreurs
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Erreur 500: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

# Route catch-all pour servir le frontend React en mode production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Servir l'application React pour toutes les routes non-API"""
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # En production, cette route ne devrait pas être appelée
    # car le frontend sera servi par Render Static Sites
    return jsonify({
        'message': 'LinkedBoost API is running',
        'version': '1.0.0',
        'docs': '/api/health'
    })

if __name__ == '__main__':
    # Créer les tables si elles n'existent pas
    with app.app_context():
        try:
            db.create_all()
            logger.info("✅ Base de données initialisée")
        except Exception as e:
            logger.error(f"❌ Erreur base de données: {e}")
    
    port = int(os.environ.get('PORT', 5000))
    
    logger.info(f"🚀 LinkedBoost API démarrant sur le port {port}")
    logger.info(f"🌐 CORS configuré")
    logger.info(f"🔗 Test API: http://localhost:{port}/api/health")
    
    app.run(host='0.0.0.0', port=port, debug=False)