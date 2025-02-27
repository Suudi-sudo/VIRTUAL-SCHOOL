import os
import json
from flask import Blueprint, request, jsonify, redirect, url_for, session, current_app
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    decode_token
)
from flask_mail import Message
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import cloudinary.uploader
from models import User, db
from datetime import datetime, timedelta
import secrets
from urllib.parse import quote_plus, urlencode

# Configuration (ensure these are set via environment variables or another config method)
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
    return jsonify({
        "msg": "Login successful",
        "access_token": access_token,
        "user_id": user.id,
        "email": user.email
    }), 200

@user_bp.route('/register', methods=['POST'])
def register():
    """Register a new user and send a welcome email."""
    data = request.get_json()

    if not data:
        return jsonify({"msg": "No input data provided"}), 400

    # Check required fields
    if not all(field in data for field in ("username", "email", "password", "role")):
        return jsonify({"msg": "Missing required fields: username, email, password, role"}), 400

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

    # Send welcome email (if mail is configured)
    mail = current_app.extensions.get('mail')
    if mail:
        try:
            msg = Message(
                subject="Welcome to Our App!",
                sender="noreply@yourapp.com",
                recipients=[data['email']]
            )
            msg.body = (
                f"Hello {data['username']},\n\n"
                "Thank you for registering at Our App. We’re excited to have you on board!\n\n"
                "Best regards,\n"
                "The Team"
            )
            mail.send(msg)
        except Exception as e:
            # Log the error, but do not fail the registration
            current_app.logger.error(f"Error sending welcome email: {e}")

    return jsonify({"msg": "User created successfully."}), 201

@user_bp.route('/login', methods=['POST', 'GET'])
def login():
    """Authenticate a user and issue a JWT token."""
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input data provided"}), 400

    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return login_user(user)

    return jsonify({"msg": "Bad email or password."}), 401

# !google login
@user_bp.route('/google_login', methods=['POST'])
def google_login():
    """Authenticate a user and issue a JWT token."""
    # Parse JSON data from the request
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request data"}), 400

    # Extract email from the request data
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Check if the user exists in the database
    user = User.query.filter_by(email=email).first()

    # If the user doesn't exist, create a new user with the "Student" role
    if not user:
        user = User(email=email, role="Student")
        db.session.add(user)
        db.session.commit()

    # Generate a JWT token for the user
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(hours=1),  # Token expires in 1 hour
        additional_claims={"role": user.role}
    )

    # Return the token and user details
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        }
    }), 200

@user_bp.route('/reset-password', methods=['POST'])
def request_reset_password():
    """
    Send a reset password link to the user's email.
    The link includes a JWT reset token as a URL parameter.
    """
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input data provided"}), 400

    email = data.get('email')
    if not email:
        return jsonify({"msg": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Email not found."}), 404

    # Generate a reset token that expires in 15 minutes
    token = create_access_token(identity=user.email, expires_delta=timedelta(minutes=15))
    # Build the reset password link (this URL should be accessible to your client/frontend)
    reset_link = url_for('user_bp.reset_password_with_token', token=token, _external=True)

    mail_instance = current_app.extensions.get('mail')
    if mail_instance:
        try:
            msg = Message(
                subject="Password Reset Request",
                recipients=[email],
                sender="noreply@yourapp.com"
            )
            # Using HTML content so that the reset link appears clickable in the email
            msg.html = (
                f"<p>Hello {user.username},</p>"
                "<p>We received a request to reset your password. Please click the link below to reset your password:</p>"
                f"<p><a href='{reset_link}'>{reset_link}</a></p>"
                "<p>This link will expire in 15 minutes.</p>"
                "<p>If you did not request a password reset, please ignore this email.</p>"
            )
            mail_instance.send(msg)
            return jsonify({"msg": "Reset link sent to your email."}), 200
        except Exception as e:
            current_app.logger.error(f"Error sending reset email: {e}")
            return jsonify({"msg": "Could not send reset email."}), 500
    else:
        return jsonify({"msg": "Mail server not configured"}), 500

@user_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password_with_token(token):
    """
    Reset the user's password using the token provided in the URL.
    Expects a JSON payload with 'new_password'.
    """
    data = request.get_json()
    if not data or 'new_password' not in data:
        return jsonify({"msg": "New password is required"}), 400

    try:
        # Decode the token to get the user's email (identity)
        decoded = decode_token(token)
        user_email = decoded.get("sub")
    except Exception as e:
        current_app.logger.error(f"Token decoding error: {e}")
        return jsonify({"msg": "Invalid or expired token"}), 400

    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"msg": "User not found."}), 404

    # Update the user's password
    user.set_password(data['new_password'])
    db.session.commit()

    return jsonify({"msg": "Password has been reset successfully."}), 200

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
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic,
            "role": user.role,
            "created_at": user.created_at
        }), 200

    if request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({"msg": "No input data provided"}), 400

        # Update username and/or other fields as necessary
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
    users_query = User.query.paginate(page=page_num, per_page=10)  # Pagination

    users_list = [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    } for user in users_query.items]

    return jsonify({
        "users": users_list,
        "total": users_query.total,
        "pages": users_query.pages,
        "current_page": page_num
    }), 200

@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Log out a user.

    Note: In a stateless JWT system, logout is typically handled on the client side by simply removing the token.
    If you implement token blacklisting, you could add the token to a blacklist here.
    """
    # For now, we'll simply return a success message.
    return jsonify({"msg": "Logout successful. Please remove your token from storage."}), 200
