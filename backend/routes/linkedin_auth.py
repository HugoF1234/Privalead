from flask import Blueprint, request, session, jsonify, redirect, url_for
from urllib.parse import urlencode
import requests
import os
from datetime import datetime, timedelta
from models.linkedin_models import LinkedInUser
from flask_sqlalchemy import SQLAlchemy
import logging

logger = logging.getLogger(__name__)

# Créer le blueprint
linkedin_auth_bp = Blueprint('linkedin_auth', __name__, url_prefix='/api/linkedin')

# Configuration LinkedIn
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "86occjps58doir")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "WPL_AP1.C8C6uXjTbpJyQUx2.Y7COPg==")
LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "https://privalead-1.onrender.com/api/linkedin/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://privalead-1.onrender.com")

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
SCOPES = "openid email profile w_member_social"

def init_linkedin_routes(db_instance):
    global db
    db = db_instance

@linkedin_auth_bp.route('/auth')
def linkedin_auth():
    """Initier l'authentification LinkedIn"""
    
    # Vérifier si l'utilisateur est connecté à Privalead
    if 'user_id' not in session:
        return jsonify({
            'error': 'Vous devez être connecté à Privalead pour lier LinkedIn',
            'redirect': f"{FRONTEND_URL}/login"
        }), 401
    
    # Générer l'URL d'authentification LinkedIn
    params = {
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": LINKEDIN_REDIRECT_URI,
        "scope": SCOPES,
        "state": f"user_{session['user_id']}_{datetime.now().timestamp()}",
        "prompt": "login"
    }
    
    auth_url = f"{LINKEDIN_AUTH_URL}?{urlencode(params)}"
    
    logger.info(f"🔗 Redirection LinkedIn pour user {session['user_id']}")
    return redirect(auth_url)

@linkedin_auth_bp.route('/callback')
def linkedin_callback():
    """Callback de l'authentification LinkedIn"""
    code = request.args.get("code")
    error = request.args.get("error")
    state = request.args.get("state")
    
    if error:
        logger.error(f"LinkedIn auth error: {error}")
        return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=auth_failed")
    
    if not code:
        logger.error("Aucun code d'autorisation reçu")
        return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=no_code")
    
    # Valider le state
    if not state or not state.startswith('user_'):
        logger.error("State invalide")
        return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=invalid_state")
    
    try:
        user_id = int(state.split('_')[1])
    except (IndexError, ValueError):
        logger.error("User ID invalide dans state")
        return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=invalid_user")

    try:
        # Échanger le code contre un token
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
            "client_id": LINKEDIN_CLIENT_ID,
            "client_secret": LINKEDIN_CLIENT_SECRET
        }
        
        logger.info("🔄 Échange du code contre un token...")
        token_response = requests.post(
            LINKEDIN_TOKEN_URL, 
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if token_response.status_code != 200:
            logger.error(f"Token exchange failed: {token_response.text}")
            return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=token_failed")
        
        token_info = token_response.json()
        access_token = token_info.get("access_token")
        expires_in = token_info.get("expires_in", 3600)
        
        if not access_token:
            logger.error("Aucun access token reçu")
            return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=no_token")
        
        # Récupérer les informations utilisateur LinkedIn
        logger.info("📋 Récupération des infos utilisateur LinkedIn...")
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get(LINKEDIN_USERINFO_URL, headers=headers, timeout=10)
        
        if user_response.status_code != 200:
            logger.error(f"User info failed: {user_response.text}")
            return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=userinfo_failed")
        
        user_info = user_response.json()
        
        # Créer ou mettre à jour l'utilisateur LinkedIn
        linkedin_user = LinkedInUser.query.filter_by(linkedin_id=user_info.get("sub")).first()
        
        if not linkedin_user:
            # Créer nouvel utilisateur LinkedIn
            linkedin_user = LinkedInUser(
                user_id=user_id,
                linkedin_id=user_info.get("sub"),
                access_token=access_token,
                email=user_info.get("email"),
                name=user_info.get("name"),
                first_name=user_info.get("given_name"),
                last_name=user_info.get("family_name"),
                picture=user_info.get("picture"),
                language=user_info.get("locale", {}).get("language", "fr"),
                email_verified=user_info.get("email_verified", False),
                token_expires_at=datetime.utcnow() + timedelta(seconds=expires_in)
            )
            db.session.add(linkedin_user)
            logger.info(f"✅ Nouvel utilisateur LinkedIn créé: {linkedin_user.email}")
        else:
            # Mettre à jour les informations existantes
            linkedin_user.user_id = user_id  # Associer au compte Privalead actuel
            linkedin_user.access_token = access_token
            linkedin_user.email = user_info.get("email")
            linkedin_user.name = user_info.get("name")
            linkedin_user.first_name = user_info.get("given_name")
            linkedin_user.last_name = user_info.get("family_name")
            linkedin_user.picture = user_info.get("picture")
            linkedin_user.email_verified = user_info.get("email_verified", False)
            linkedin_user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            linkedin_user.is_active = True
            linkedin_user.updated_at = datetime.utcnow()
            logger.info(f"✅ Utilisateur LinkedIn mis à jour: {linkedin_user.email}")
        
        db.session.commit()
        
        # Stocker les infos en session
        session['linkedin_user_id'] = linkedin_user.id
        session['linkedin_access_token'] = access_token
        
        logger.info(f"🎉 LinkedIn connecté avec succès pour user {user_id}")
        return redirect(f"{FRONTEND_URL}/dashboard?linkedin_success=true")
        
    except Exception as e:
        logger.error(f"Erreur lors de l'authentification LinkedIn: {str(e)}")
        return redirect(f"{FRONTEND_URL}/dashboard?linkedin_error=server_error")

@linkedin_auth_bp.route('/status')
def linkedin_status():
    """Vérifier le statut de connexion LinkedIn"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    linkedin_user = LinkedInUser.query.filter_by(user_id=user_id, is_active=True).first()
    
    if not linkedin_user:
        return jsonify({
            'connected': False,
            'message': 'LinkedIn non connecté'
        })
    
    # Vérifier si le token est expiré
    if linkedin_user.token_expires_at and linkedin_user.token_expires_at < datetime.utcnow():
        return jsonify({
            'connected': False,
            'expired': True,
            'message': 'Token LinkedIn expiré'
        })
    
    return jsonify({
        'connected': True,
        'user': linkedin_user.to_dict(),
        'expiresAt': linkedin_user.token_expires_at.isoformat() if linkedin_user.token_expires_at else None
    })

@linkedin_auth_bp.route('/disconnect', methods=['POST'])
def linkedin_disconnect():
    """Déconnecter LinkedIn"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    
    user_id = session['user_id']
    linkedin_user = LinkedInUser.query.filter_by(user_id=user_id).first()
    
    if linkedin_user:
        linkedin_user.is_active = False
        linkedin_user.access_token = None
        linkedin_user.updated_at = datetime.utcnow()
        db.session.commit()
    
    # Nettoyer la session
    session.pop('linkedin_user_id', None)
    session.pop('linkedin_access_token', None)
    
    logger.info(f"🔌 LinkedIn déconnecté pour user {user_id}")
    return jsonify({
        'success': True,
        'message': 'LinkedIn déconnecté avec succès'
    })
