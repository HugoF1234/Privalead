from flask import Blueprint, request, session, jsonify
from backend.models.user import User
from backend.app import db
import logging

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
def get_user_profile():
    """Récupérer le profil utilisateur"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    return jsonify(user.to_dict())

@users_bp.route('/profile', methods=['PUT'])
def update_user_profile():
    """Mettre à jour le profil utilisateur"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    data = request.get_json()
    
    # Mettre à jour les champs autorisés
    allowed_fields = ['secteur', 'interets']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    try:
        db.session.commit()
        logger.info(f"Profile updated for user {user.email}")
        return jsonify({
            "success": True, 
            "user": user.to_dict(),
            "message": "Profil mis à jour avec succès"
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Profile update error: {str(e)}")
        return jsonify({"error": "Erreur lors de la mise à jour"}), 500

@users_bp.route('/stats', methods=['GET'])
def get_user_stats():
    """Récupérer les statistiques utilisateur"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    from datetime import datetime
    from backend.models.post import Post
    
    # Statistiques des posts
    total_posts = Post.query.filter_by(user_id=user.id, scheduled=False).count()
    scheduled_posts = Post.query.filter_by(user_id=user.id, scheduled=True).filter(
        Post.published_at > datetime.utcnow()
    ).count()
    
    # Métriques simulées pour la démo
    import random
    monthly_views = f"{random.randint(8, 15)}.{random.randint(1, 9)}K"
    engagement_growth = f"+{random.randint(15, 35)}%"
    
    return jsonify({
        "totalPosts": total_posts,
        "scheduledPosts": scheduled_posts,
        "monthlyViews": monthly_views,
        "engagementGrowth": engagement_growth
    })
