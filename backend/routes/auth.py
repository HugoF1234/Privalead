from flask import Blueprint, request, session, jsonify, redirect, url_for
from urllib.parse import urlencode
import requests
import os
from backend.models.user import User
from backend.app import db
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

# Configuration LinkedIn
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI")
LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
SCOPES = "openid email profile w_member_social"

@auth_bp.route('/linkedin')
def linkedin_auth():
    """Initier l'authentification LinkedIn"""
    params = {
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": LINKEDIN_REDIRECT_URI,
        "scope": SCOPES,
        "state": "random123",
        "prompt": "login"
    }
    auth_url = f"{LINKEDIN_AUTH_URL}?{urlencode(params)}"
    return redirect(auth_url)

@auth_bp.route('/callback')
def linkedin_callback():
    """Callback de l'authentification LinkedIn"""
    code = request.args.get("code")
    error = request.args.get("error")
    
    if error:
        logger.error(f"LinkedIn auth error: {error}")
        return redirect(f"{os.getenv('FRONTEND_URL')}/?error=linkedin_auth_failed")
    
    if not code:
        return redirect(f"{os.getenv('FRONTEND_URL')}/?error=no_code")

    try:
        # Échanger le code contre un token
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
            "client_id": LINKEDIN_CLIENT_ID,
            "client_secret": LINKEDIN_CLIENT_SECRET
        }
        
        token_response = requests.post(
            LINKEDIN_TOKEN_URL, 
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if token_response.status_code != 200:
            logger.error(f"Token exchange failed: {token_response.text}")
            return redirect(f"{os.getenv('FRONTEND_URL')}/?error=token_exchange_failed")
        
        token_info = token_response.json()
        access_token = token_info.get("access_token")
        
        # Récupérer les informations utilisateur
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get(LINKEDIN_USERINFO_URL, headers=headers)
        
        if user_response.status_code != 200:
            logger.error(f"User info failed: {user_response.text}")
            return redirect(f"{os.getenv('FRONTEND_URL')}/?error=user_info_failed")
        
        user_info = user_response.json()
        
        # Stocker les informations en session
        session['access_token'] = access_token
        session['profile'] = {
            'sub': user_info.get("sub", ""),
            'email': user_info.get("email", ""),
            'name': user_info.get("name", ""),
            'first_name': user_info.get("given_name", ""),
            'last_name': user_info.get("family_name", ""),
            'picture': user_info.get("picture", ""),
            'language': user_info.get("locale", {}).get("language", "fr"),
            'country': user_info.get("locale", {}).get("country", "FR"),
            'email_verified': user_info.get("email_verified", False)
        }
        
        # Créer ou mettre à jour l'utilisateur en base
        user = User.query.filter_by(sub=session['profile']['sub']).first()
        if not user:
            user = User(sub=session['profile']['sub'])
            db.session.add(user)
        
        # Mettre à jour les informations
        for key, value in session['profile'].items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        db.session.commit()
        logger.info(f"User {user.email} authenticated successfully")
        
        # Rediriger vers le frontend
        return redirect(f"{os.getenv('FRONTEND_URL')}/dashboard")
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return redirect(f"{os.getenv('FRONTEND_URL')}/?error=auth_failed")

@auth_bp.route('/status')
def auth_status():
    """Vérifier le statut d'authentification"""
    if 'profile' in session:
        return jsonify({
            'authenticated': True,
            'user': session['profile']
        })
    else:
        return jsonify({
            'authenticated': False
        }), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Déconnexion"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'})
