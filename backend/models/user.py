from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# Ne pas importer db ici, il sera injecté
db = None

def init_db(database):
    global db
    db = database

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
    
    # Relations
    posts = db.relationship('Post', backref='author', lazy=True, cascade='all, delete-orphan')
    
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
    
    def __repr__(self):
        return f'<User {self.email}>'