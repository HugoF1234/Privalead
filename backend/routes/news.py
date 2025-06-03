from flask import Blueprint, request, session, jsonify
from models import User, Post
from services import GeminiService
import logging

logger = logging.getLogger(__name__)

news_bp = Blueprint('news', __name__)

@news_bp.route('/', methods=['GET'])
def get_news():
    """Récupérer les actualités"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    
    keyword = request.args.get('keyword', '')
    language = request.args.get('language', 'fr')
    sector = user.secteur if user else 'general'
    
    try:
        news_service = NewsService()
        
        if keyword:
            articles = news_service.search_by_keyword(keyword, language=language)
        else:
            articles = news_service.get_by_sector(sector, language=language)
        
        logger.info(f"News retrieved: {len(articles)} articles")
        return jsonify({"articles": articles})
        
    except Exception as e:
        logger.error(f"News retrieval error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@news_bp.route('/trending', methods=['GET'])
def get_trending_news():
    """Récupérer les actualités tendance"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    sector = user.secteur if user else 'general'
    
    try:
        news_service = NewsService()
        trending = news_service.get_trending(sector)
        
        return jsonify({"trending": trending})
        
    except Exception as e:
        logger.error(f"Trending news error: {str(e)}")
        return jsonify({"error": str(e)}), 500
