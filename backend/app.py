# backend/app.py - Version corrigée pour Render

import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import logging
from models.linkedin_models import LinkedInUser, LinkedInPost, ContentTemplate, init_linkedin_db
from services.linkedin_service import LinkedInService
from services.gemini_service import GeminiService
from services.news_service import NewsService
# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation Flask
app = Flask(__name__)

# Configuration CORS
CORS(app, 
     origins=[
         'https://linkedboost-frontend.onrender.com',
         'https://privalead-1.onrender.com',  # Si c'est le nom de votre frontend
         'http://localhost:3000',
         'http://127.0.0.1:3000'
     ],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'Accept'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Configuration base de données
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    # Correction pour PostgreSQL sur Render
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///linkedboost_dev.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialisation extensions
init_linkedin_db(db)
db = SQLAlchemy(app)

# Modèles de données
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

# Service de génération IA (simulation)
class GeminiService:
    def __init__(self):
        self.simulation_mode = True  # Mode simulation pour Render
    
    def generate_from_prompt(self, prompt, tone="professionnel", sector="general"):
        logger.info(f"🤖 Génération simulée: {prompt[:50]}...")
        
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
        
        else:
            return f"""💭 Réflexion du jour : {prompt}

Dans notre quotidien professionnel, on oublie parfois l'essentiel :
✅ Prendre le temps de la réflexion
✅ Échanger avec ses pairs
✅ Tester et itérer rapidement

Parfois, les meilleures idées viennent des conversations les plus simples.

Et vous, comment abordez-vous ce sujet ? 🤔

#Réflexion #Partage #{sector.capitalize()}"""

# Routes API
# Route de test CORS
@app.after_request
def after_request(response):
    """Ajout des headers CORS explicites"""
    origin = request.headers.get('Origin')
    if origin in [
        'https://linkedboost-frontend.onrender.com',
        'https://privalead-1.onrender.com', 
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ]:
        response.headers.add('Access-Control-Allow-Origin', origin)
    
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Routes API
@app.route('/api/health')
def health_check():
    """Route de santé pour vérifier que l'API fonctionne"""
    try:
        # Test base de données
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
        'cors': 'enabled',
        'environment': os.getenv('FLASK_ENV', 'development')
    })
# Routes d'authentification
@app.route('/api/auth/status')
def auth_status():
    logger.info("📱 Statut d'auth demandé")
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
    return jsonify({'message': 'Logged out successfully'})

# Routes utilisateur
@app.route('/api/users/profile')
def get_user_profile():
    logger.info("📱 Profile demandé")
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


@app.route('/api')
def api_root():
    return jsonify({
        'message': 'LinkedBoost API',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/auth/status',
            'posts': '/api/posts',
            'users': '/api/users/profile'
        }
    })

@app.route('/api/users/stats')
def get_user_stats():
    logger.info("📊 Stats demandées")
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
    logger.info("📝 Posts demandés")
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
            }
        ]
    })

@app.route('/api/posts/scheduled')
def get_scheduled_posts():
    logger.info("⏰ Posts programmés demandés")
    return jsonify({
        'scheduledPosts': [
            {
                'id': 4,
                'content': '🎯 Post programmé pour demain matin !',
                'publishedAt': '2025-06-04T08:00:00',
                'scheduled': True,
                'status': 'scheduled'
            }
        ]
    })

@app.route('/api/posts/generate', methods=['POST'])
def generate_post():
    data = request.get_json()
    prompt = data.get('prompt', '')
    tone = data.get('tone', 'professionnel')
    
    logger.info(f"🤖 Génération de post: {prompt[:50]}...")
    
    gemini = GeminiService()
    draft = gemini.generate_from_prompt(prompt, tone)
    
    return jsonify({
        'success': True,
        'draft': draft
    })

@app.route('/api/posts/publish', methods=['POST'])
def publish_post():
    data = request.get_json()
    content = data.get('content', '')
    publish_now = data.get('publishNow', False)
    
    logger.info(f"📤 Publication simulée: {len(content)} caractères")
    
    if publish_now:
        return jsonify({
            'success': True,
            'message': 'Post publié avec succès !',
        })
    else:
        return jsonify({
            'success': True,
            'message': 'Post programmé avec succès !',
        })

# Routes des actualités
@app.route('/api/news')
def get_news():
    logger.info("📰 News demandées")
    return jsonify({
        'articles': [
            {
                'id': 1,
                'title': 'L\'IA révolutionne le marketing digital',
                'description': 'Les nouvelles technologies d\'intelligence artificielle transforment la façon dont les entreprises approchent le marketing digital...',
                'source': 'TechCrunch',
                'date': '2025-06-03',
                'url': 'https://example.com/article1'
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

@app.route('/')
def index():
    return jsonify({
        'message': 'LinkedBoost API is running!',
        'version': '1.0.0',
        'status': 'healthy',
        'documentation': {
            'health': '/api/health',
            'auth': '/api/auth/status',
            'posts': '/api/posts',
            'users': '/api/users/profile',
            'stats': '/api/users/stats',
            'news': '/api/news'
        },
        'frontend': 'https://privalead-1.onrender.com'
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
    app.run(host='0.0.0.0', port=port, debug=False)
