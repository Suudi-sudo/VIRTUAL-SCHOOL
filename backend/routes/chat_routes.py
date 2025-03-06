from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Chat, User  # Ensure User is imported
from datetime import datetime

chat_bp = Blueprint('chat_bp', __name__)

# Get all chats for a specific class (only for chats in the user's school)
@chat_bp.route('/chats/<int:class_id>', methods=['GET'])
@jwt_required()
def get_chats(class_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    page = request.args.get('page', 1, type=int)
    # Filter chats by class_id and by the user's school_id
    chats_paginated = Chat.query.filter_by(class_id=class_id, school_id=user.school_id)\
                                .order_by(Chat.timestamp.asc())\
                                .paginate(page=page, per_page=10)

    chats = [{
        "id": chat.id,
        "class_id": chat.class_id,
        "sender_id": chat.sender_id,
        "sender_name": chat.sender.username if chat.sender else "Anonymous",
        "message": chat.message,
        "timestamp": chat.timestamp.isoformat()
    } for chat in chats_paginated.items]

    return jsonify({
        "chats": chats,
        "total": chats_paginated.total,
        "pages": chats_paginated.pages,
        "current_page": chats_paginated.page
    }), 200

# Send a new chat message (only allowed if the class belongs to the user's school)
@chat_bp.route('/chats', methods=['POST'])
@jwt_required()
def create_chat():
    data = request.get_json()
    user_id = get_jwt_identity()  # Get the user ID from the token
    user = User.query.get(user_id)

    if not data or 'class_id' not in data or 'message' not in data:
        return jsonify({"msg": "class_id and message are required"}), 400

    # Optionally, if you have a Class model, verify the class belongs to user.school_id here

    new_chat = Chat(
        class_id=data['class_id'],
        school_id=user.school_id,  # Set automatically from the user's school
        sender_id=user_id,
        message=data['message'],
        timestamp=datetime.utcnow()
    )
    db.session.add(new_chat)
    db.session.commit()

    return jsonify({
        "msg": "Chat message sent",
        "chat": {
            "id": new_chat.id,
            "class_id": new_chat.class_id,
            "sender_id": new_chat.sender_id,
            "sender_name": user.username if user else "Anonymous",
            "message": new_chat.message,
            "timestamp": new_chat.timestamp.isoformat()
        }
    }), 201

# Get a specific chat message (only if it belongs to the user's school)
@chat_bp.route('/chats/message/<int:chat_id>', methods=['GET'])
@jwt_required()
def get_chat(chat_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    chat = Chat.query.get_or_404(chat_id)
    
    if chat.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to view this chat"}), 403

    return jsonify({
        "id": chat.id,
        "class_id": chat.class_id,
        "sender_id": chat.sender_id,
        "sender_name": chat.sender.username if chat.sender else "Anonymous",
        "message": chat.message,
        "timestamp": chat.timestamp.isoformat()
    }), 200

# Update a chat message (only the sender can edit, and only within the user's school)
@chat_bp.route('/chats/message/<int:chat_id>', methods=['PUT'])
@jwt_required()
def update_chat(chat_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    chat = Chat.query.get_or_404(chat_id)

    if chat.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to update this chat"}), 403

    if chat.sender_id != user_id:
        return jsonify({"msg": "You can only edit your own messages"}), 403

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"msg": "No input provided"}), 400

    chat.message = data['message']
    db.session.commit()
    
    return jsonify({"msg": "Chat updated"}), 200

# Delete a chat message (only the sender can delete, and only within the user's school)
@chat_bp.route('/chats/message/<int:chat_id>', methods=['DELETE'])
@jwt_required()
def delete_chat(chat_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    chat = Chat.query.get_or_404(chat_id)
    
    if chat.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to delete this chat"}), 403

    if chat.sender_id != user_id:
        return jsonify({"msg": "You can only delete your own messages"}), 403

    db.session.delete(chat)
    db.session.commit()
    return jsonify({"msg": "Chat deleted"}), 200
