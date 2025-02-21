from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Resource
from datetime import datetime

resource_bp = Blueprint('resource_bp', __name__)

@resource_bp.route('/resources', methods=['GET'])
@jwt_required()
def get_resources():
    page = request.args.get('page', 1, type=int)
    resources_paginated = Resource.query.paginate(page=page, per_page=10)
    resources = [{
        "id": res.id,
        "class_id": res.class_id,
        "uploaded_by": res.uploaded_by,
        "file_url": res.file_url,
        "description": res.description
    } for res in resources_paginated.items]
    return jsonify({
        "resources": resources,
        "total": resources_paginated.total,
        "pages": resources_paginated.pages,
        "current_page": resources_paginated.page
    }), 200

@resource_bp.route('/resources', methods=['POST'])
@jwt_required()
def create_resource():
    data = request.get_json()
    if not data or 'class_id' not in data or 'uploaded_by' not in data or 'file_url' not in data:
        return jsonify({"msg": "class_id, uploaded_by, and file_url required"}), 400
    new_resource = Resource(
        class_id=data['class_id'],
        uploaded_by=data['uploaded_by'],
        file_url=data['file_url'],
        description=data.get('description', '')
    )
    db.session.add(new_resource)
    db.session.commit()
    return jsonify({"msg": "Resource created", "id": new_resource.id}), 201

@resource_bp.route('/resources/<int:resource_id>', methods=['GET'])
@jwt_required()
def get_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    return jsonify({
        "id": res.id,
        "class_id": res.class_id,
        "uploaded_by": res.uploaded_by,
        "file_url": res.file_url,
        "description": res.description
    }), 200

@resource_bp.route('/resources/<int:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400
    if 'description' in data:
        res.description = data['description']
    db.session.commit()
    return jsonify({"msg": "Resource updated"}), 200

@resource_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    db.session.delete(res)
    db.session.commit()
    return jsonify({"msg": "Resource deleted"}), 200
