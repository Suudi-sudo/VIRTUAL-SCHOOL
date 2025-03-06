import os
import json
from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    decode_token
)
from flask_mail import Message
import cloudinary.uploader
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime, timedelta
from models import User, School, Class, StudentsClasses, db
import secrets
from urllib.parse import quote_plus, urlencode



import jwt
# Configuration (ensure these are set via environment variables or another config method)

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)

CLOUD_NAME = os.environ.get("CLOUD_NAME")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

user_bp = Blueprint('user_bp', __name__)

# ------------------------------------------------------------------------------
# Helper (optional) - removed old usage of pyjwt
# ------------------------------------------------------------------------------
def login_user(user):
    """
    If you prefer a helper function for login,
    you can reuse this in /login or remove it entirely.
    """
    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role},
        expires_delta=timedelta(hours=24)
    )
    return jsonify({
        "msg": "Login successful",
        "access_token": access_token,
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }), 200

# ------------------------------------------------------------------------------
# REGISTER
# ------------------------------------------------------------------------------
@user_bp.route('/register', methods=['POST'])
def register():
    """Register a new user and send a welcome email."""
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input data provided"}), 400

    required_fields = ("username", "email", "password", "role")
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields: username, email, password, role"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already registered."}), 400

    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        role=data['role']
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    # Optional: send welcome email
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
            current_app.logger.error(f"Error sending welcome email: {e}")

    return jsonify({"msg": "User created successfully."}), 201

# ------------------------------------------------------------------------------
# LOGIN
# ------------------------------------------------------------------------------
@user_bp.route('/login', methods=['POST', 'GET'])
def login():
    """Authenticate a user and issue a JWT token (Flask-JWT-Extended style)."""
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

        # ✅ Generate JWT token with user ID & role
        token = jwt.encode(
            {
                "id": user.id, 
                "role": user.role,  # ✅ Include role
               "exp": datetime.utcnow() + timedelta(hours=24)  # ✅ Fixed!
            },
            current_app.config["SECRET_KEY"],  # ✅ Avoids circular import
            algorithm="HS256"
        )
        
        return jsonify({"token": token, "role": user.role})  # ✅ Include token & role


    return jsonify({"msg": "Bad email or password."}), 401

#    !google login
@user_bp.route('/google_login', methods=['POST'])
def google_login():
    """Authenticate via Google OAuth and issue a JWT token."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request data"}), 400

    email = data.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Create a new user with default 'Student' role
        user = User(email=email, role="Student")
        db.session.add(user)
        db.session.commit()

    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(hours=1),
        additional_claims={"role": user.role}
    )

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        }
    }), 200

# ------------------------------------------------------------------------------
# RESET PASSWORD + OTHER ROUTES
# ------------------------------------------------------------------------------
@user_bp.route('/reset-password', methods=['POST'])
def request_reset_password():
    """Send a reset password link to the user's email."""
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input data provided"}), 400

    email = data.get('email')
    if not email:
        return jsonify({"msg": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Email not found."}), 404

    token = create_access_token(identity=user.email, expires_delta=timedelta(minutes=15))
    reset_link = url_for('user_bp.reset_password_with_token', token=token, _external=True)

    mail_instance = current_app.extensions.get('mail')
    if mail_instance:
        try:
            msg = Message(
                subject="Password Reset Request",
                recipients=[email],
                sender="noreply@yourapp.com"
            )
            msg.html = (
                f"<p>Hello {user.username},</p>"
                "<p>We received a request to reset your password. Please click the link below to reset:</p>"
                f"<p><a href='{reset_link}'>{reset_link}</a></p>"
                "<p>This link will expire in 15 minutes.</p>"
                "<p>If you did not request this, ignore this email.</p>"
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
    """Reset the user's password using the token provided in the URL."""
    data = request.get_json()
    if not data or 'new_password' not in data:
        return jsonify({"msg": "New password is required"}), 400

    try:
        decoded = decode_token(token)
        user_email = decoded.get("sub")
    except Exception as e:
        current_app.logger.error(f"Token decoding error: {e}")
        return jsonify({"msg": "Invalid or expired token"}), 400

    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"msg": "User not found."}), 404

    user.set_password(data['new_password'])
    db.session.commit()

    return jsonify({"msg": "Password has been reset successfully."}), 200

# ------------------------------------------------------------------------------
# PROFILE (requires JWT)
# ------------------------------------------------------------------------------
@user_bp.route('/profile/<int:user_id>', methods=['GET', 'PUT'])
@jwt_required()
def profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found."}), 404

    if request.method == 'GET':
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
        if 'username' in data:
            user.username = data['username']
        db.session.commit()
        return jsonify({"msg": "Profile updated successfully."}), 200

# ------------------------------------------------------------------------------
# UPLOAD PROFILE PIC
# ------------------------------------------------------------------------------
@user_bp.route('/upload-profile-pic', methods=['POST'])
@jwt_required()
def upload_profile_pic():
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

# ------------------------------------------------------------------------------
# GET /users?role=student or /users?role=educator => Filter by role
# ------------------------------------------------------------------------------
@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    page_num = request.args.get('page', 1, type=int)
    role = request.args.get('role', None, type=str)

    query = User.query
    if role:
        query = query.filter_by(role=role)

    users_query = query.paginate(page=page_num, per_page=10)
    users_list = [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role": u.role
    } for u in users_query.items]

    return jsonify({
        "users": users_list,
        "total": users_query.total,
        "pages": users_query.pages,
        "current_page": page_num
    }), 200

# ------------------------------------------------------------------------------
# LOGOUT
# ------------------------------------------------------------------------------
@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    With JWT, logout is basically handled client-side:
    remove the token from localStorage (or wherever you stored it).
    """
    return jsonify({"msg": "Logout successful. Please remove your token from storage."}), 200

# ------------------------------------------------------------------------------
# UPDATE USER
# ------------------------------------------------------------------------------
@user_bp.route('/users/<int:user_id>/update', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    user_to_update = User.query.get(user_id)
    if not user_to_update:
        return jsonify({"msg": "User not found."}), 404

    data = request.get_json() or {}
    if 'username' in data:
        user_to_update.username = data['username']
    if 'email' in data:
        user_to_update.email = data['email']
    db.session.commit()

    return jsonify({"msg": "User updated successfully."}), 200

# ------------------------------------------------------------------------------
# DELETE USER (Admins Only)
# ------------------------------------------------------------------------------
@user_bp.route('/users/<int:user_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"msg": "Invalid current user."}), 401

    if current_user.role.lower() != "admin":
        return jsonify({"msg": "Only admins can delete users."}), 403

    user_to_delete = User.query.get(user_id)
    if not user_to_delete:
        return jsonify({"msg": "User not found."}), 404

    db.session.delete(user_to_delete)
    db.session.commit()
    return jsonify({"msg": "User deleted successfully."}), 200

# ------------------------------------------------------------------------------
# ADD STUDENT TO SCHOOL
# ------------------------------------------------------------------------------
@user_bp.route('/schools/<int:school_id>/add-student', methods=['PATCH'])
@jwt_required()
def add_student_to_school(school_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"msg": "Invalid current user."}), 401

    school = School.query.get(school_id)
    if not school:
        return jsonify({"msg": "School not found."}), 404

    # Role-based authorization
    if current_user.role.lower() not in ['admin', 'school_admin']:
        return jsonify({"msg": "Only admins or school admins can add students."}), 403

    data = request.get_json() or {}
    student_id = data.get('student_id')
    if not student_id:
        return jsonify({"msg": "student_id is required"}), 400

    student = User.query.get(student_id)
    if not student:
        return jsonify({"msg": "User not found."}), 404

    if student.role.lower() != 'student':
        return jsonify({"msg": "User is not a student."}), 400

    student.school_id = school_id
    db.session.commit()
    return jsonify({"msg": "Student assigned to school successfully."}), 200

# ------------------------------------------------------------------------------
# ADD EDUCATOR TO SCHOOL
# ------------------------------------------------------------------------------
@user_bp.route('/schools/<int:school_id>/add-educator', methods=['PATCH'])
@jwt_required()
def add_educator_to_school(school_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"msg": "Invalid current user."}), 401

    school = School.query.get(school_id)
    if not school:
        return jsonify({"msg": "School not found."}), 404

    # Role-based authorization
    if current_user.role.lower() not in ['admin', 'school_admin']:
        return jsonify({"msg": "Only admins or school admins can add educators."}), 403

    data = request.get_json() or {}
    teacher_id = data.get('teacher_id')
    if not teacher_id:
        return jsonify({"msg": "teacher_id is required"}), 400

    teacher = User.query.get(teacher_id)
    if not teacher:
        return jsonify({"msg": "User not found."}), 404

    if teacher.role.lower() != 'educator':
        return jsonify({"msg": "User is not an educator."}), 400

    teacher.school_id = school_id
    db.session.commit()
    return jsonify({"msg": "Educator assigned to school successfully."}), 200

# ------------------------------------------------------------------------------
# ADD STUDENT TO CLASS (MANY-TO-MANY)
# ------------------------------------------------------------------------------
@user_bp.route('/classes/<int:class_id>/add-student', methods=['POST'])
@jwt_required()
def add_student_to_class(class_id):
    data = request.get_json() or {}
    student_id = data.get('student_id')
    if not student_id:
        return jsonify({"msg": "student_id is required"}), 400

    class_ = Class.query.get(class_id)
    if not class_:
        return jsonify({"msg": "Class not found."}), 404

    student = User.query.get(student_id)
    if not student:
        return jsonify({"msg": "User not found."}), 404

    if student.role.lower() != 'student':
        return jsonify({"msg": "User is not a student."}), 400

    # Must be in the same school
    if student.school_id != class_.school_id:
        return jsonify({"msg": "Student must belong to the same school as the class."}), 400

    enrollment = StudentsClasses(student_id=student.id, class_id=class_.id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"msg": "Student added to class successfully."}), 201
