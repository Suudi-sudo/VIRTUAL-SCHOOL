import os
import secrets
import string
import datetime

from flask import Blueprint, request, jsonify, abort
from flask_mail import Message
from werkzeug.security import generate_password_hash
from models import db, User

user_bp = Blueprint('user_bp', __name__)

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
        print(f"📧 Email sent to {recipient}")
    except Exception as e:
        print(f"❌ Error sending email: {e}")

@user_bp.route('/users/register', methods=['POST'])
def register():
    # Import here to avoid circular imports
    from app import mail

    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body.")

    # We expect 'password' as part of the request
    required = ["name", "email", "password", "role", "school_id"]
    for field in required:
        if field not in data:
            abort(400, f"Missing field: {field}")

    # Ensure the email isn't already taken
    if User.query.filter_by(email=data['email']).first():
        abort(400, "Email already exists.")

    # Hash the password provided by the user (NOT their email password)
    hashed_password = generate_password_hash(data['password'])

    # Create and store the new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password,
        role=data['role'],
        school_id=data['school_id']
    )
    db.session.add(new_user)
    db.session.commit()

    # Send a welcome email to the user
    email_subject = "🎉 Welcome to Virtual School!"
    email_body = f"""
    Hi {new_user.name},

    Welcome to Virtual School! 🎓

    Your account has been successfully created. 
    Hope you enjoy our services!
    Best regards,
    Virtual School Team
    """
    send_email(new_user.email, email_subject, email_body, mail)

    # Return the newly created user (serialized) and a 201 status
    return jsonify(serialize_user(new_user)), 201
