import os
from flask import Flask, jsonify, request, render_template_string
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation Flask
app = Flask(__name__)

# Configuration CORS
CORS(app, 
     origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
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

# Modèles définis directement ici (temporaire)
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
            'shares': self.shares_count
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
        'cors': 'enabled',
        'frontend_url': 'http://localhost:3000'
    })

# Routes temporaires pour tester l'intégration React
@app.route('/api/users/profile')
def get_user_profile_temp():
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

@app.route('/api/users/stats')
def get_user_stats_temp():
    logger.info("📊 Stats demandées depuis React")
    return jsonify({
        'totalPosts': 12,
        'scheduledPosts': 3,
        'monthlyViews': '15.2K',
        'engagementGrowth': '+32%'
    })

@app.route('/api/posts')
def get_posts_temp():
    logger.info("📝 Posts demandés depuis React")
    return jsonify({
        'posts': [
            {
                'id': 1,
                'content': '🚀 Premier post de test depuis notre nouvelle API LinkedBoost !',
                'publishedAt': '2025-01-20T10:30:00',
                'scheduled': False,
                'likes': 25,
                'comments': 8,
                'shares': 3
            },
            {
                'id': 2,
                'content': '💡 L\'IA transforme notre façon de créer du contenu LinkedIn...',
                'publishedAt': '2025-01-19T14:15:00',
                'scheduled': False,
                'likes': 18,
                'comments': 5,
                'shares': 2
            }
        ]
    })

@app.route('/api/posts/scheduled')
def get_scheduled_posts_temp():
    logger.info("⏰ Posts programmés demandés depuis React")
    return jsonify({
        'scheduledPosts': [
            {
                'id': 3,
                'content': '🎯 Post programmé pour demain matin !',
                'publishedAt': '2025-01-21T08:00:00',
                'scheduled': True
            }
        ]
    })

@app.route('/api/news')
def get_news_temp():
    logger.info("📰 News demandées depuis React")
    return jsonify({
        'articles': [
            {
                'id': 1,
                'title': 'L\'IA révolutionne le marketing digital',
                'description': 'Les nouvelles technologies d\'IA transforment...',
                'source': 'TechCrunch',
                'date': '2025-01-20',
                'url': 'https://example.com'
            }
        ]
    })

# Route catch-all pour servir le frontend React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Servir l'application React pour toutes les routes non-API"""
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>LinkedBoost - API Active</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
            }
            .container { 
                padding: 2rem;
                border-radius: 10px;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
            }
            .status-dot {
                width: 20px;
                height: 20px;
                background-color: #4ade80;
                border-radius: 50%;
                margin: 20px auto;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.7; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.7; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 LinkedBoost API</h1>
            <div class="status-dot"></div>
            <p>Backend Flask actif et fonctionnel !</p>
            <p><small>API prête pour React ✅</small></p>
            <p><a href="/api/health" style="color: #a0c0ff;">Tester l'API</a></p>
        </div>
    </body>
    </html>
    """)

@app.errorhandler(500)
def handle_500(e):
    logger.error(f"Erreur 500: {str(e)}")
    return jsonify({'error': 'Erreur serveur'}), 500

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
    logger.info(f"🌐 CORS configuré pour: http://localhost:3000")
    logger.info(f"🔗 Test API: http://localhost:{port}/api/health")
    
    app.run(host='0.0.0.0', port=port, debug=True)