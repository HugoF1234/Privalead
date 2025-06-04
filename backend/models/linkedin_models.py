from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = None

def init_linkedin_db(database):
    global db
    db = database

class LinkedInUser(db.Model):
    __tablename__ = 'linkedin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    linkedin_id = db.Column(db.String(128), unique=True, nullable=False)
    access_token = db.Column(db.Text)
    refresh_token = db.Column(db.Text)
    email = db.Column(db.String(120))
    name = db.Column(db.String(120))
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    picture = db.Column(db.String(250))
    headline = db.Column(db.String(250))
    industry = db.Column(db.String(120))
    location = db.Column(db.String(120))
    language = db.Column(db.String(10), default='fr')
    email_verified = db.Column(db.Boolean, default=False)
    token_expires_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    posts = db.relationship('LinkedInPost', backref='linkedin_user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'linkedinId': self.linkedin_id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'picture': self.picture,
            'headline': self.headline,
            'industry': self.industry,
            'location': self.location,
            'language': self.language,
            'emailVerified': self.email_verified,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<LinkedInUser {self.email}>'

class LinkedInPost(db.Model):
    __tablename__ = 'linkedin_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    linkedin_user_id = db.Column(db.Integer, db.ForeignKey('linkedin_users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    linkedin_post_id = db.Column(db.String(100))
    published_at = db.Column(db.DateTime)
    scheduled_for = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='draft')  # draft, scheduled, published, failed
    
    # Métriques LinkedIn
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    
    # Métadonnées
    tone = db.Column(db.String(50))
    generated_by_ai = db.Column(db.Boolean, default=False)
    prompt_used = db.Column(db.Text)
    article_source = db.Column(db.JSON)  # Si basé sur un article
    hashtags = db.Column(db.JSON)
    mentions = db.Column(db.JSON)
    images = db.Column(db.JSON)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'linkedinPostId': self.linkedin_post_id,
            'publishedAt': self.published_at.isoformat() if self.published_at else None,
            'scheduledFor': self.scheduled_for.isoformat() if self.scheduled_for else None,
            'status': self.status,
            'metrics': {
                'likes': self.likes_count,
                'comments': self.comments_count,
                'shares': self.shares_count,
                'views': self.views_count
            },
            'metadata': {
                'tone': self.tone,
                'generatedByAi': self.generated_by_ai,
                'promptUsed': self.prompt_used,
                'articleSource': self.article_source,
                'hashtags': self.hashtags or [],
                'mentions': self.mentions or [],
                'images': self.images or []
            },
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<LinkedInPost {self.id}>'

class ContentTemplate(db.Model):
    __tablename__ = 'content_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50))
    prompt_template = db.Column(db.Text, nullable=False)
    tone = db.Column(db.String(50))
    tags = db.Column(db.JSON)
    icon = db.Column(db.String(10))
    is_active = db.Column(db.Boolean, default=True)
    usage_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'promptTemplate': self.prompt_template,
            'tone': self.tone,
            'tags': self.tags or [],
            'icon': self.icon,
            'isActive': self.is_active,
            'usageCount': self.usage_count
        }
    
    def __repr__(self):
        return f'<ContentTemplate {self.name}>'
