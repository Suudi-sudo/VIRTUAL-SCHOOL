# chat_routes.py

from flask import Blueprint, request, jsonify, abort
from datetime import datetime
from models import db, Chat

chat_bp = Blueprint('chat_bp', __name__)

def serialize_chat(chat):
    return {
        "id": chat.id,
        "class_id": chat.class_id,
        "sender_id": chat.sender_id,
        "message": chat.message,
        "timestamp": chat.timestamp.isoformat() if chat.timestamp else None
    }

@chat_bp.route('/chats', methods=['GET'])
def get_chats():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = Chat.query.paginate(page=page, per_page=per_page, error_out=False)
    chats_data = [serialize_chat(c) for c in pagination.items]
    return jsonify({
        "chats": chats_data,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200

@chat_bp.route('/chats/<int:chat_id>', methods=['GET'])
def get_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    return jsonify(serialize_chat(chat)), 200

@chat_bp.route('/chats', methods=['POST'])
def create_chat():
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    required_fields = ["class_id", "sender_id", "message"]
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")
    timestamp_value = data.get('timestamp')
    if timestamp_value:
        try:
            timestamp_value = datetime.fromisoformat(timestamp_value)
        except ValueError:
            abort(400, "Invalid timestamp format. Must be ISO8601.")
    else:
        timestamp_value = datetime.utcnow()
    new_chat = Chat(
        class_id=data["class_id"],
        sender_id=data["sender_id"],
        message=data["message"],
        timestamp=timestamp_value
    )
    db.session.add(new_chat)
    db.session.commit()
    return jsonify(serialize_chat(new_chat)), 201

@chat_bp.route('/chats/<int:chat_id>', methods=['PUT'])
def update_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    if "class_id" in data:
        chat.class_id = data["class_id"]
    if "sender_id" in data:
        chat.sender_id = data["sender_id"]
    if "message" in data:
        chat.message = data["message"]
    if "timestamp" in data:
        try:
            chat.timestamp = datetime.fromisoformat(data["timestamp"])
        except ValueError:
            abort(400, "Invalid timestamp format. Must be ISO8601.")
    db.session.commit()
    return jsonify(serialize_chat(chat)), 200

@chat_bp.route('/chats/<int:chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"message": "Chat record deleted successfully"}), 200
