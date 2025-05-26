from flask import Blueprint, request, session, jsonify
from backend.models.user import User
from backend.models.post import Post
from backend.app import db
from backend.services.linkedin_service import LinkedInService
from backend.services.gemini_service import GeminiService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/', methods=['GET'])
def get_posts():
    """Récupérer tous les posts de l'utilisateur"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
    
    return jsonify({
        "posts": [post.to_dict() for post in posts]
    })

@posts_bp.route('/scheduled', methods=['GET'])
def get_scheduled_posts():
    """Récupérer les posts programmés"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    now = datetime.utcnow()
    scheduled_posts = Post.query.filter_by(
        user_id=user.id, 
        scheduled=True
    ).filter(Post.published_at > now).order_by(Post.published_at).all()
    
    return jsonify({
        "scheduledPosts": [post.to_dict() for post in scheduled_posts]
    })

@posts_bp.route('/generate', methods=['POST'])
def generate_post():
    """Générer un post avec l'IA"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    data = request.get_json()
    prompt = data.get('prompt')
    tone = data.get('tone', 'professionnel')
    selected_article = data.get('selectedArticle')
    
    if not prompt and not selected_article:
        return jsonify({"error": "Prompt ou article requis"}), 400
    
    try:
        gemini_service = GeminiService()
        
        if selected_article:
            draft = gemini_service.generate_from_article(
                article=selected_article,
                tone=tone,
                sector=user.secteur
            )
        else:
            draft = gemini_service.generate_from_prompt(
                prompt=prompt,
                tone=tone,
                sector=user.secteur
            )
        
        logger.info(f"Post generated for user {user.email}")
        return jsonify({"draft": draft})
        
    except Exception as e:
        logger.error(f"Post generation error: {str(e)}")
        return jsonify({"error": f"Erreur de génération: {str(e)}"}), 500

@posts_bp.route('/publish', methods=['POST'])
def publish_post():
    """Publier ou programmer un post"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    data = request.get_json()
    content = data.get('content')
    publish_time = data.get('publishTime')
    publish_now = data.get('publishNow', False)
    
    if not content:
        return jsonify({"error": "Contenu requis"}), 400
    
    try:
        # Convertir la date si fournie
        if publish_time:
            publish_datetime = datetime.fromisoformat(publish_time.replace('Z', ''))
        else:
            publish_datetime = datetime.utcnow()
        
        # Si publication maintenant ou si la date est passée
        if publish_now or publish_datetime <= datetime.utcnow():
            # Publication immédiate sur LinkedIn
            linkedin_service = LinkedInService(session.get('access_token'))
            success = linkedin_service.publish_post(content, user.sub)
            
            if success:
                # Sauvegarder en base
                post = Post(
                    content=content,
                    published_at=datetime.utcnow(),
                    user_id=user.id,
                    scheduled=False,
                    status='published'
                )
                db.session.add(post)
                db.session.commit()
                
                logger.info(f"Post published for user {user.email}")
                return jsonify({"success": True, "message": "Post publié avec succès"})
            else:
                return jsonify({"error": "Erreur lors de la publication LinkedIn"}), 500
        else:
            # Programmation
            post = Post(
                content=content,
                published_at=publish_datetime,
                user_id=user.id,
                scheduled=True,
                status='scheduled'
            )
            db.session.add(post)
            db.session.commit()
            
            logger.info(f"Post scheduled for user {user.email}")
            return jsonify({"success": True, "message": "Post programmé avec succès"})
            
    except Exception as e:
        logger.error(f"Post publish error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@posts_bp.route('/', methods=['DELETE'])
def delete_post(post_id):
    """Supprimer un post"""
    if 'profile' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    
    user = User.query.filter_by(sub=session['profile']['sub']).first()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    
    post = Post.query.filter_by(id=post_id, user_id=user.id).first()
    if not post:
        return jsonify({"error": "Post introuvable"}), 404
    
    try:
        db.session.delete(post)
        db.session.commit()
        
        logger.info(f"Post {post_id} deleted by user {user.email}")
        return jsonify({"success": True, "message": "Post supprimé avec succès"})
        
    except Exception as e:
        logger.error(f"Post deletion error: {str(e)}")
        return jsonify({"error": "Erreur lors de la suppression"}), 500
