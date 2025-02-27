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
from models import User, School, Class, StudentsClasses, db
from datetime import datetime, timedelta
import secrets
from urllib.parse import quote_plus, urlencode

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

def login_user(user):
    """Create and return a JWT token for the given user (never expires if configured)."""
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "msg": "Login successful",
        "access_token": access_token,
        "user_id": user.id,
        "email": user.email,
        "role": user.role
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
        role=data['role']  # e.g., 'student', 'educator', 'admin'
    )
    new_user.set_password(data['password'])  # Hash password

    db.session.add(new_user)
    db.session.commit()

    # Optional: Send welcome email
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

#    !google login
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

    # Generate a reset token that expires in 15 minutes (or set to False if you want no expiration)
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

@user_bp.route('/profile/<int:user_id>', methods=['GET', 'PUT'])
@jwt_required()
def profile(user_id):
    """Retrieve or update a user's profile."""
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

# ------------------------------------------------------------------------------
# GET /users?role=student or /users?role=educator => Filters by role
# Otherwise returns all users
# ------------------------------------------------------------------------------
@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Retrieve a paginated list of users, optionally filtered by role."""
    page_num = request.args.get('page', 1, type=int)
    role = request.args.get('role', None, type=str)  # e.g. 'student', 'educator', 'admin'

    query = User.query
    if role:
        query = query.filter_by(role=role)

    users_query = query.paginate(page=page_num, per_page=10)
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
    """Stateless logout: the client just removes the token."""
    return jsonify({"msg": "Logout successful. Please remove your token from storage."}), 200

# ------------------------------------------------------------------------------
# ADDITIONAL ROUTES: UPDATE, DELETE, ASSIGN USERS TO SCHOOL OR CLASS
# ------------------------------------------------------------------------------
@user_bp.route('/users/<int:user_id>/update', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """
    Update a user's details (e.g., username, email).
    Adjust role checks if you only want certain roles to do this.
    """
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

@user_bp.route('/users/<int:user_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Permanently remove a user from the database.
    Only admins can delete users.
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"msg": "Invalid current user."}), 401

    # Must be admin
    if current_user.role.lower() != "admin":
        return jsonify({"msg": "Only admins can delete users."}), 403

    user_to_delete = User.query.get(user_id)
    if not user_to_delete:
        return jsonify({"msg": "User not found."}), 404

    db.session.delete(user_to_delete)
    db.session.commit()
    return jsonify({"msg": "User deleted successfully."}), 200

@user_bp.route('/schools/<int:school_id>/add-student', methods=['PATCH'])
@jwt_required()
def add_student_to_school(school_id):
    """
    Assign a user with role='student' to a specific school.
    Only the user who created (owns) that school can add students.
    Expects JSON: { "student_id": 123 }
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"msg": "Invalid current user."}), 401

    school = School.query.get(school_id)
    if not school:
        return jsonify({"msg": "School not found."}), 404

    # Must be the owner of this school
    if school.created_by != current_user_id:
        return jsonify({"msg": "Only the school owner can add students to this school."}), 403

    data = request.get_json() or {}
    student_id = data.get('student_id')
    if not student_id:
        return jsonify({"msg": "student_id is required"}), 400

    student = User.query.get(student_id)
    if not student:
        return jsonify({"msg": "User not found."}), 404

    # Must be role=student
    if student.role.lower() != 'student':
        return jsonify({"msg": "User is not a student."}), 400

    student.school_id = school_id
    db.session.commit()
    return jsonify({"msg": "Student assigned to school successfully."}), 200

# NEW: Add Educator to School
@user_bp.route('/schools/<int:school_id>/add-educator', methods=['PATCH'])
@jwt_required()
def add_educator_to_school(school_id):
    """
    Assign a user with role='educator' (teacher) to a specific school.
    Only the user who created (owns) that school can add educators.
    Expects JSON: { "teacher_id": 123 }
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"msg": "Invalid current user."}), 401

    school = School.query.get(school_id)
    if not school:
        return jsonify({"msg": "School not found."}), 404

    # Must be the owner of this school
    if school.created_by != current_user_id:
        return jsonify({"msg": "Only the school owner can add educators to this school."}), 403

    data = request.get_json() or {}
    teacher_id = data.get('teacher_id')
    if not teacher_id:
        return jsonify({"msg": "teacher_id is required"}), 400

    teacher = User.query.get(teacher_id)
    if not teacher:
        return jsonify({"msg": "User not found."}), 404

    # Must be role=educator
    if teacher.role.lower() != 'educator':
        return jsonify({"msg": "User is not an educator."}), 400

    # Optionally, store the teacher's school_id
    teacher.school_id = school_id
    db.session.commit()
    return jsonify({"msg": "Educator assigned to school successfully."}), 200

@user_bp.route('/classes/<int:class_id>/add-student', methods=['POST'])
@jwt_required()
def add_student_to_class(class_id):
    """
    Enroll a student (role='student') in a specific class (many-to-many).
    The student must already belong to the same school as the class.
    Expects JSON: { "student_id": 123 }
    """
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

    # Must match the same school
    if student.school_id != class_.school_id:
        return jsonify({"msg": "Student must belong to the same school as the class."}), 400

    enrollment = StudentsClasses(student_id=student.id, class_id=class_.id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify({"msg": "Student added to class successfully."}), 201
