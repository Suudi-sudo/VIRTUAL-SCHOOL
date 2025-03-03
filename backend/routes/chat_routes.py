from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Chat, User  # Ensure you import User as well
from datetime import datetime

chat_bp = Blueprint('chat_bp', __name__)

# Get all chats for a specific class (organized by latest messages last)
@chat_bp.route('/chats/<int:class_id>', methods=['GET'])
@jwt_required()
def get_chats(class_id):
    page = request.args.get('page', 1, type=int)
    chats_paginated = Chat.query.filter_by(class_id=class_id).order_by(Chat.timestamp.asc()).paginate(page=page, per_page=10)

    chats = [{
        "id": chat.id,
        "class_id": chat.class_id,
        "sender_id": chat.sender_id,
        "sender_name": chat.sender.username if chat.sender else "Anonymous",  # Added sender_name
        "message": chat.message,
        "timestamp": chat.timestamp.isoformat()
    } for chat in chats_paginated.items]

    return jsonify({
        "chats": chats,
        "total": chats_paginated.total,
        "pages": chats_paginated.pages,
        "current_page": chats_paginated.page
    }), 200

# Send a new chat message
@chat_bp.route('/chats', methods=['POST'])
@jwt_required()
def create_chat():
    data = request.get_json()
    user_id = get_jwt_identity()  # Get the user ID from the token

    if not data or 'class_id' not in data or 'message' not in data:
        return jsonify({"msg": "class_id and message are required"}), 400

    new_chat = Chat(
        class_id=data['class_id'],
        sender_id=user_id,
        message=data['message'],
        timestamp=datetime.utcnow()
    )
    db.session.add(new_chat)
    db.session.commit()

    # Retrieve sender's name using the User model
    user = User.query.get(user_id)
    sender_name = user.username if user else "Anonymous"

    return jsonify({
        "msg": "Chat message sent",
        "chat": {
            "id": new_chat.id,
            "class_id": new_chat.class_id,
            "sender_id": new_chat.sender_id,
            "sender_name": sender_name,  # Added sender_name
            "message": new_chat.message,
            "timestamp": new_chat.timestamp.isoformat()
        }
    }), 201

# Get a specific chat message
@chat_bp.route('/chats/message/<int:chat_id>', methods=['GET'])
@jwt_required()
def get_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    return jsonify({
        "id": chat.id,
        "class_id": chat.class_id,
        "sender_id": chat.sender_id,
        "sender_name": chat.sender.username if chat.sender else "Anonymous",  # Added sender_name
        "message": chat.message,
        "timestamp": chat.timestamp.isoformat()
    }), 200

# Update a chat message (only the sender can edit their message)
@chat_bp.route('/chats/message/<int:chat_id>', methods=['PUT'])
@jwt_required()
def update_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    user_id = get_jwt_identity()

    if chat.sender_id != user_id:
        return jsonify({"msg": "You can only edit your own messages"}), 403

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"msg": "No input provided"}), 400

    chat.message = data['message']
    db.session.commit()
    
    return jsonify({"msg": "Chat updated"}), 200

# Delete a chat message (only the sender can delete their message)
@chat_bp.route('/chats/message/<int:chat_id>', methods=['DELETE'])
@jwt_required()
def delete_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    user_id = get_jwt_identity()

    if chat.sender_id != user_id:
        return jsonify({"msg": "You can only delete your own messages"}), 403

    db.session.delete(chat)
    db.session.commit()
    return jsonify({"msg": "Chat deleted"}), 200
