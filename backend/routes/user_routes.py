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
    try:
        mail.send(msg)
        print(f"📧 Email sent to {recipient}")  # Debugging
    except Exception as e:
        print(f"❌ Error sending email: {e}")  # Debugging

def generate_reset_token():
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def is_token_blacklisted(decoded_jwt):
    jti = decoded_jwt['jti']
    return jti in BLACKLISTED_TOKENS

def parse_pagination_args():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    return page, per_page

@user_bp.route('/users/register', methods=['POST'])
def register():
    from app import mail  # ✅ Import mail inside function to prevent circular imports

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

    # ✅ Send Welcome Email
    email_subject = "🎉 Welcome to Virtual School!"
    email_body = f"""
    Hi {new_user.name},

    Welcome to Virtual School! 🎓

    Your account has been successfully created. You can now log in and start using our platform.

    Best regards,  
    Virtual School Team
    """
    send_email(new_user.email, email_subject, email_body, mail)

    return jsonify(serialize_user(new_user)), 201
