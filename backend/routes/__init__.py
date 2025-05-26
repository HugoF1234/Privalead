from .auth import auth_bp
from .posts import posts_bp
from .news import news_bp
from .users import users_bp

__all__ = ['auth_bp', 'posts_bp', 'news_bp', 'users_bp']
