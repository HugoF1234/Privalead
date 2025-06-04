from flask import Blueprint, request, session, jsonify
from datetime import datetime, timedelta
from models.linkedin_models import LinkedInUser, LinkedInPost, ContentTemplate
from services.gemini_service import GeminiService
from services.linkedin_service import LinkedInService
from services.news_service import NewsService
import logging

logger = logging.getLogger(__name__)

# Créer le blueprint
linkedin_content_bp = Blueprint('linkedin_content', __name__, url_prefix='/api/linkedin')

def init_linkedin_content_routes(db_instance):
    global db
    db = db_instance

@linkedin_content_bp.route('/generate', methods=['POST'])
def generate_content():
    """Générer du contenu LinkedIn avec l'IA"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Données manquantes'}), 400
    
    prompt = data.get('prompt', '').strip()
    tone = data.get('tone', 'professionnel')
    selected_article = data.get('selectedArticle')
    template_id = data.get('templateId')
    
    # Vérifier qu'on a soit un prompt, soit un template, soit un article
    if not prompt and not template_id and not selected_article:
        return jsonify({'error': 'Prompt, template ou article requis'}), 400
    
    try:
        # Récupérer l'utilisateur LinkedIn
        linkedin_user = LinkedInUser.query.filter_by(user_id=user_id, is_active=True).first()
        if not linkedin_user:
            return jsonify({'error': 'LinkedIn non connecté'}), 400
        
        # Préparer le contexte utilisateur
        user_context = {
            'name': f"{linkedin_user.first_name} {linkedin_user.last_name}",
            'headline': linkedin_user.headline or f"Expert {linkedin_user.industry or 'Professionnel'}",
            'industry': linkedin_user.industry or 'general'
        }
        
        # Si un template est sélectionné
        if template_id:
            template = ContentTemplate.query.get(template_id)
            if template:
                prompt = template.prompt_template
                tone = template.tone or tone
                # Incrémenter le compteur d'usage
                template.usage_count += 1
                db.session.commit()
        
        # Initialiser le service Gemini
        gemini_service = GeminiService()
        
        # Générer le contenu
        generated_content = gemini_service.generate_linkedin_post(
            prompt=prompt,
            tone=tone,
            industry=linkedin_user.industry or 'general',
            user_context=user_context,
            article_context=selected_article
        )
        
        # Analyser la performance estimée
        performance_analysis = gemini_service.analyze_content_performance(generated_content)
        
        # Générer des hashtags
        hashtags = gemini_service.generate_hashtags(generated_content, linkedin_user.industry or 'general')
        
        # Suggestion de timing optimal
        optimal_timing = gemini_service.optimize_posting_time(linkedin_user.industry or 'general')
        
        logger.info(f"✅ Contenu généré pour user {user_id}")
        
        return jsonify({
            'success': True,
            'content': generated_content,
            'analysis': performance_analysis,
            'hashtags': hashtags,
            'optimalTiming': optimal_timing,
            'metadata': {
                'tone': tone,
                'prompt': prompt,
                'articleSource': selected_article,
                'generatedAt': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur génération contenu: {str(e)}")
        return jsonify({'error': f'Erreur de génération: {str(e)}'}), 500

@linkedin_content_bp.route('/publish', methods=['POST'])
def publish_content():
    """Publier ou programmer du contenu LinkedIn"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Données manquantes'}), 400
    
    content = data.get('content', '').strip()
    publish_now = data.get('publishNow', False)
    scheduled_time = data.get('scheduledTime')
    metadata = data.get('metadata', {})
    
    if not content:
        return jsonify({'error': 'Contenu requis'}), 400
    
    try:
        # Récupérer l'utilisateur LinkedIn
        linkedin_user = LinkedInUser.query.filter_by(user_id=user_id, is_active=True).first()
        if not linkedin_user:
            return jsonify({'error': 'LinkedIn non connecté'}), 400
        
        # Créer le post en base
        linkedin_post = LinkedInPost(
            user_id=user_id,
            linkedin_user_id=linkedin_user.id,
            content=content,
            tone=metadata.get('tone'),
            generated_by_ai=True,
            prompt_used=metadata.get('prompt'),
            article_source=metadata.get('articleSource'),
            hashtags=metadata.get('hashtags', [])
        )
        
        if publish_now:
            # Publication immédiate
            linkedin_service = LinkedInService(linkedin_user.access_token)
            result = linkedin_service.publish_post(
                content=content,
                linkedin_id=linkedin_user.linkedin_id
            )
            
            if result['success']:
                linkedin_post.status = 'published'
                linkedin_post.published_at = datetime.utcnow()
                linkedin_post.linkedin_post_id = result.get('post_id')
                db.session.add(linkedin_post)
                db.session.commit()
                
                logger.info(f"📤 Post publié immédiatement pour user {user_id}")
                return jsonify({
                    'success': True,
                    'message': 'Post publié avec succès sur LinkedIn',
                    'postId': linkedin_post.id,
                    'linkedinPostId': result.get('post_id')
                })
            else:
                logger.error(f"Erreur publication LinkedIn: {result['error']}")
                return jsonify({'error': result['error']}), 500
        
        else:
            # Programmation
            if not scheduled_time:
                return jsonify({'error': 'Heure de programmation requise'}), 400
            
            try:
                schedule_datetime = datetime.fromisoformat(scheduled_time.replace('Z', ''))
            except ValueError:
                return jsonify({'error': 'Format de date invalide'}), 400
            
            if schedule_datetime <= datetime.utcnow():
                return jsonify({'error': 'La date de programmation doit être dans le futur'}), 400
            
            linkedin_post.status = 'scheduled'
            linkedin_post.scheduled_for = schedule_datetime
            db.session.add(linkedin_post)
            db.session.commit()
            
            logger.info(f"📅 Post programmé pour {schedule_datetime} (user {user_id})")
            return jsonify({
                'success': True,
                'message': f'Post programmé pour le {schedule_datetime.strftime("%d/%m/%Y à %H:%M")}',
                'postId': linkedin_post.id,
                'scheduledFor': schedule_datetime.isoformat()
            })
            
    except Exception as e:
        logger.error(f"Erreur publication/programmation: {str(e)}")
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@linkedin_content_bp.route('/posts', methods=['GET'])
def get_posts():
    """Récupérer les posts LinkedIn de l'utilisateur"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    status_filter = request.args.get('status')  # draft, scheduled, published
    limit = int(request.args.get('limit', 20))
    
    try:
        query = LinkedInPost.query.filter_by(user_id=user_id)
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        posts = query.order_by(LinkedInPost.created_at.desc()).limit(limit).all()
        
        # Récupérer les analytics pour les posts publiés
        linkedin_user = LinkedInUser.query.filter_by(user_id=user_id, is_active=True).first()
        linkedin_service = LinkedInService(linkedin_user.access_token if linkedin_user else None)
        
        posts_data = []
        for post in posts:
            post_data = post.to_dict()
            
            # Ajouter les analytics si le post est publié
            if post.status == 'published' and post.linkedin_post_id and linkedin_user:
                analytics = linkedin_service.get_post_analytics(post.linkedin_post_id)
                post_data['analytics'] = analytics
            
            posts_data.append(post_data)
        
        return jsonify({
            'success': True,
            'posts': posts_data,
            'total': len(posts_data)
        })
        
    except Exception as e:
        logger.error(f"Erreur récupération posts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@linkedin_content_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Supprimer un post"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    
    try:
        post = LinkedInPost.query.filter_by(id=post_id, user_id=user_id).first()
        if not post:
            return jsonify({'error': 'Post introuvable'}), 404
        
        db.session.delete(post)
        db.session.commit()
        
        logger.info(f"🗑️ Post {post_id} supprimé (user {user_id})")
        return jsonify({
            'success': True,
            'message': 'Post supprimé avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur suppression post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@linkedin_content_bp.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """Modifier un post"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    data = request.get_json()
    
    try:
        post = LinkedInPost.query.filter_by(id=post_id, user_id=user_id).first()
        if not post:
            return jsonify({'error': 'Post introuvable'}), 404
        
        # Seuls les posts non publiés peuvent être modifiés
        if post.status == 'published':
            return jsonify({'error': 'Impossible de modifier un post publié'}), 400
        
        # Mettre à jour les champs autorisés
        if 'content' in data:
            post.content = data['content']
        
        if 'scheduledFor' in data:
            try:
                post.scheduled_for = datetime.fromisoformat(data['scheduledFor'].replace('Z', ''))
            except ValueError:
                return jsonify({'error': 'Format de date invalide'}), 400
        
        post.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"✏️ Post {post_id} modifié (user {user_id})")
        return jsonify({
            'success': True,
            'message': 'Post modifié avec succès',
            'post': post.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Erreur modification post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@linkedin_content_bp.route('/templates', methods=['GET'])
def get_templates():
    """Récupérer les templates de contenu"""
    try:
        templates = ContentTemplate.query.filter_by(is_active=True).order_by(ContentTemplate.usage_count.desc()).all()
        
        return jsonify({
            'success': True,
            'templates': [template.to_dict() for template in templates]
        })
        
    except Exception as e:
        logger.error(f"Erreur récupération templates: {str(e)}")
        return jsonify({'error': str(e)}), 500

@linkedin_content_bp.route('/news', methods=['GET'])
def get_news():
    """Récupérer les actualités pour inspiration"""
    keyword = request.args.get('keyword', '')
    language = request.args.get('language', 'fr')
    industry = request.args.get('industry', 'general')
    
    try:
        news_service = NewsService()
        
        if keyword:
            result = news_service.search_news(keyword, language)
        else:
            result = news_service.get_industry_news(industry, language)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Erreur récupération actualités: {str(e)}")
        return jsonify({'error': str(e)}), 500

@linkedin_content_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Récupérer les analytics des posts LinkedIn"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    
    try:
        # Statistiques générales
        total_posts = LinkedInPost.query.filter_by(user_id=user_id, status='published').count()
        scheduled_posts = LinkedInPost.query.filter_by(user_id=user_id, status='scheduled').count()
        
        # Posts récents avec analytics
        recent_posts = LinkedInPost.query.filter_by(
            user_id=user_id, 
            status='published'
        ).order_by(LinkedInPost.published_at.desc()).limit(10).all()
        
        # Calculer les métriques totales (simulation)
        total_likes = sum(post.likes_count for post in recent_posts)
        total_comments = sum(post.comments_count for post in recent_posts)
        total_shares = sum(post.shares_count for post in recent_posts)
        total_views = sum(post.views_count for post in recent_posts)
        
        # Calculs d'engagement
        avg_engagement = ((total_likes + total_comments + total_shares) / max(total_views, 1)) * 100 if total_views > 0 else 0
        
        return jsonify({
            'success': True,
            'overview': {
                'totalPosts': total_posts,
                'scheduledPosts': scheduled_posts,
                'totalLikes': total_likes,
                'totalComments': total_comments,
                'totalShares': total_shares,
                'totalViews': total_views,
                'avgEngagement': round(avg_engagement, 2)
            },
            'recentPosts': [post.to_dict() for post in recent_posts]
        })
        
    except Exception as e:
        logger.error(f"Erreur récupération analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500
