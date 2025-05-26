from datetime import datetime
from backend.app import db

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    published_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scheduled = db.Column(db.Boolean, default=False)
    linkedin_post_id = db.Column(db.String(100))  # ID du post LinkedIn
    status = db.Column(db.String(20), default='draft')  # draft, scheduled, published, failed
    
    # Métriques (simulées pour la démo)
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
            'views': self.views_count,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f''
