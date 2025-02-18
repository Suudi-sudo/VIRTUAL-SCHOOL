import os
import secrets
import string
import datetime

from flask import Blueprint, request, jsonify, abort, redirect, url_for, session
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt
)
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from datetime import datetime
from urllib.parse import urlencode

user_bp = Blueprint('user_bp', __name__)

BLACKLISTED_TOKENS = set()
PASSWORD_RESET_TOKENS = {}
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your_google_client_id_here")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "your_google_secret_here")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5000/users/social-login/callback")

def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "school_id": user.school_id,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

def send_email(recipient, subject, body, mail):
    msg = Message(subject, recipients=[recipient])
    msg.body = body
    mail.send(msg)

def generate_reset_token():
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def is_token_blacklisted(decoded_jwt):
    jti = decoded_jwt['jti']
    return jti in BLACKLISTED_TOKENS

def parse_pagination_args():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    return page, per_page

@user_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    page, per_page = parse_pagination_args()
    query = User.query.order_by(User.id.asc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    users_data = [serialize_user(u) for u in pagination.items]
    return jsonify({
        "users": users_data,
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page
    }), 200

@user_bp.route('/users/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body.")
    required = ["name", "email", "password", "role", "school_id"]
    for field in required:
        if field not in data:
            abort(400, f"Missing field: {field}")
    if User.query.filter_by(email=data['email']).first():
        abort(400, "Email already exists.")
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password,
        role=data['role'],
        school_id=data['school_id']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(serialize_user(new_user)), 201

@user_bp.route('/users/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body.")
    required = ["email", "password"]
    for field in required:
        if field not in data:
            abort(400, f"Missing field: {field}")
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        abort(401, "Invalid email or password.")
    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token}), 200

@user_bp.route('/users/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    BLACKLISTED_TOKENS.add(jti)
    return jsonify({"message": "Successfully logged out."}), 200

@user_bp.route('/users/password-reset', methods=['POST'])
def password_reset_request():
    data = request.get_json()
    if not data or "email" not in data:
        abort(400, "Missing email field.")
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        abort(404, "User not found.")
    reset_token = generate_reset_token()
    PASSWORD_RESET_TOKENS[reset_token] = user.id
    print(f"DEBUG: Sending password reset token {reset_token} to {user.email}")
    return jsonify({"message": "Password reset token sent via email."}), 200

@user_bp.route('/users/password-reset/<reset_token>', methods=['POST'])
def password_reset_confirm(reset_token):
    data = request.get_json()
    if not data or "new_password" not in data:
        abort(400, "Missing new_password field.")
    if reset_token not in PASSWORD_RESET_TOKENS:
        abort(400, "Invalid or expired reset token.")
    user_id = PASSWORD_RESET_TOKENS[reset_token]
    user = User.query.get(user_id)
    if not user:
        abort(404, "User not found.")
    user.password_hash = generate_password_hash(data["new_password"])
    db.session.commit()
    del PASSWORD_RESET_TOKENS[reset_token]
    return jsonify({"message": "Password has been reset successfully."}), 200

@user_bp.route('/users/social-login/google', methods=['GET'])
def google_login():
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return redirect(google_auth_url)

@user_bp.route('/users/social-login/callback', methods=['GET'])
def google_login_callback():
    auth_code = request.args.get('code')
    if not auth_code:
        abort(400, "Missing auth code from Google.")
    google_email = "user_from_google@example.com"
    user = User.query.filter_by(email=google_email).first()
    if not user:
        hashed_password = generate_password_hash("google_oauth_placeholder")
        user = User(
            name="Google User",
            email=google_email,
            password_hash=hashed_password,
            role="student",
            school_id=1
        )
        db.session.add(user)
        db.session.commit()
    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token, "email": user.email}), 200
