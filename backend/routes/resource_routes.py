# resource_routes.py

from flask import Blueprint, request, jsonify, abort
from datetime import datetime
from models import db, Resource

resource_bp = Blueprint('resource_bp', __name__)

def serialize_resource(resource):
    return {
        "id": resource.id,
        "class_id": resource.class_id,
        "uploaded_by": resource.uploaded_by,
        "file_url": resource.file_url,
        "description": resource.description,
        "uploaded_at": resource.uploaded_at.isoformat() if resource.uploaded_at else None
    }

def parse_iso_datetime(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except ValueError:
        return None

@resource_bp.route('/resources', methods=['GET'])
def get_resources():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = Resource.query.paginate(page=page, per_page=per_page, error_out=False)
    resources_data = [serialize_resource(r) for r in pagination.items]

    return jsonify({
        "resources": resources_data,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200

@resource_bp.route('/resources/<int:resource_id>', methods=['GET'])
def get_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    return jsonify(serialize_resource(resource)), 200

@resource_bp.route('/resources', methods=['POST'])
def create_resource():
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    required_fields = ["class_id", "uploaded_by", "file_url"]
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")

    dt_value = parse_iso_datetime(data.get('uploaded_at'))
    if data.get('uploaded_at') and not dt_value:
        abort(400, "Invalid uploaded_at format. Must be ISO8601.")
    if not dt_value:
        dt_value = datetime.utcnow()

    new_resource = Resource(
        class_id=data["class_id"],
        uploaded_by=data["uploaded_by"],
        file_url=data["file_url"],
        description=data.get("description", ""),
        uploaded_at=dt_value
    )
    db.session.add(new_resource)
    db.session.commit()
    return jsonify(serialize_resource(new_resource)), 201

@resource_bp.route('/resources/<int:resource_id>', methods=['PUT'])
def update_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    if "class_id" in data:
        resource.class_id = data["class_id"]
    if "uploaded_by" in data:
        resource.uploaded_by = data["uploaded_by"]
    if "file_url" in data:
        resource.file_url = data["file_url"]
    if "description" in data:
        resource.description = data["description"]
    if "uploaded_at" in data:
        dt_value = parse_iso_datetime(data["uploaded_at"])
        if data["uploaded_at"] and not dt_value:
            abort(400, "Invalid uploaded_at format. Must be ISO8601.")
        resource.uploaded_at = dt_value if dt_value else resource.uploaded_at
    db.session.commit()
    return jsonify(serialize_resource(resource)), 200

@resource_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    db.session.delete(resource)
    db.session.commit()
    return jsonify({"message": "Resource deleted successfully"}), 200
