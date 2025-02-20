import os
import json
from flask import Blueprint, request, jsonify, redirect, url_for, session
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
from google.oauth2 import id_token
from google.auth.transport import requests
import cloudinary.uploader
from models import User, db
from urllib.parse import quote_plus, urlencode

# Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
CLOUD_NAME = os.environ.get("CLOUD_NAME")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

# Configure Cloudinary
cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

# Blueprint Configuration
user_bp = Blueprint('user_bp', __name__)

def login_user(user):
    """Create and return a JWT token for the given user."""
    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200

@user_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already registered."}), 400

    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        role=data['role']
    )
    new_user.set_password(data['password'])  # Hash password

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully."}), 201

@user_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and issue a JWT token."""
    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        return login_user(user)

    return jsonify({"msg": "Bad email or password."}), 401

@user_bp.route("/google/login")
def google_login():
    """Initiate Google OAuth flow."""
    redirect_uri = url_for('user_bp.google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@user_bp.route("/google/callback")
def google_callback():
    """Handle the Google OAuth callback."""
    try:
        token = oauth.google.authorize_access_token()
    except Exception as e:
        return jsonify({"msg": "Authentication failed.", "error": str(e)}), 400
    
    user_info = oauth.google.get('userinfo').json()
    
    # Check if user exists
    user = User.query.filter_by(email=user_info['email']).first()
    
    if not user:
        # Create a new user
        user = User(
            username=user_info['name'],
            email=user_info['email'],
            role='student',  # Default role for new users
            google_id=user_info['id']  # Store Google ID
        )
        db.session.add(user)
        db.session.commit()
    
    # Log in the user
    return login_user(user)

@user_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Send a reset token to the user's email."""
    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()

    if user:
        token = create_access_token(identity=user.email)  # Generate reset token with JWT
        msg = Message("Password Reset Request", recipients=[data['email']])
        msg.body = f"Your password reset token is: {token}"
        mail.send(msg)

        return jsonify({"msg": "Reset token sent to your email."}), 200

    return jsonify({"msg": "Email not found."}), 404

@user_bp.route('/profile/<int:user_id>', methods=['GET', 'PUT'])
@jwt_required()
def profile(user_id):
    """Retrieve or update a user's profile."""
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found."}), 404

    if request.method == 'GET':
        # Return user's profile details
        return jsonify({
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic,
            "role": user.role,
            "created_at": user.created_at
        }), 200

    if request.method == 'PUT':
        data = request.get_json()

        # Update username and/or profile picture
        if 'username' in data:
            user.username = data['username']
        
        db.session.commit()
        return jsonify({"msg": "Profile updated successfully."}), 200

@user_bp.route('/upload-profile-pic', methods=['POST'])
@jwt_required()
def upload_profile_pic():
    """Upload a profile picture to Cloudinary."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found."}), 404

    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    try:
        upload_result = cloudinary.uploader.upload(file)
        user.profile_pic = upload_result['secure_url']
        db.session.commit()
        return jsonify({"msg": "Profile picture updated successfully.", "url": user.profile_pic}), 200
    except Exception as e:
        return jsonify({"msg": "Failed to upload image.", "error": str(e)}), 500

@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Retrieve a paginated list of users."""
    page_num = request.args.get('page', 1, type=int)

    users_query = User.query.paginate(page=page_num, per_page=10)  # Pagination applied
    
    users_list = [{"id": user.id, "username": user.username, "email": user.email} for user in users_query.items]

    return jsonify({
        "users": users_list,
        "total": users_query.total,
        "pages": users_query.pages,
        "current_page": page_num
    }), 200
