from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Chat
from datetime import datetime

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('/chats', methods=['GET'])
@jwt_required()
def get_chats():
    page = request.args.get('page', 1, type=int)
    chats_paginated = Chat.query.paginate(page=page, per_page=10)
    chats = [{
        "id": chat.id,
        "class_id": chat.class_id,
        "sender_id": chat.sender_id,
        "message": chat.message,
        "timestamp": chat.timestamp.isoformat()
    } for chat in chats_paginated.items]
    return jsonify({
        "chats": chats,
        "total": chats_paginated.total,
        "pages": chats_paginated.pages,
        "current_page": chats_paginated.page
    }), 200

@chat_bp.route('/chats', methods=['POST'])
@jwt_required()
def create_chat():
    data = request.get_json()
    if not data or not all(k in data for k in ('class_id', 'sender_id', 'message')):
        return jsonify({"msg": "class_id, sender_id and message required"}), 400
    new_chat = Chat(
        class_id=data['class_id'],
        sender_id=data['sender_id'],
        message=data['message'],
        timestamp=datetime.utcnow()
    )
    db.session.add(new_chat)
    db.session.commit()
    return jsonify({"msg": "Chat created", "id": new_chat.id}), 201

@chat_bp.route('/chats/<int:chat_id>', methods=['GET'])
@jwt_required()
def get_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    return jsonify({
        "id": chat.id,
        "class_id": chat.class_id,
        "sender_id": chat.sender_id,
        "message": chat.message,
        "timestamp": chat.timestamp.isoformat()
    }), 200

@chat_bp.route('/chats/<int:chat_id>', methods=['PUT'])
@jwt_required()
def update_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400
    if 'message' in data:
        chat.message = data['message']
    db.session.commit()
    return jsonify({"msg": "Chat updated"}), 200

@chat_bp.route('/chats/<int:chat_id>', methods=['DELETE'])
@jwt_required()
def delete_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"msg": "Chat deleted"}), 200
