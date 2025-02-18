# school_routes.py

from flask import Blueprint, request, jsonify, abort
from datetime import datetime
from models import db, School

school_bp = Blueprint('school_bp', __name__)

def serialize_school(school):
    return {
        "id": school.id,
        "name": school.name,
        "created_by": school.created_by,
        "created_at": school.created_at.isoformat() if school.created_at else None
    }

def parse_iso_datetime(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except ValueError:
        return None

@school_bp.route('/schools', methods=['GET'])
def get_schools():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = School.query.paginate(page=page, per_page=per_page, error_out=False)
    schools_data = [serialize_school(s) for s in pagination.items]

    return jsonify({
        "schools": schools_data,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200

@school_bp.route('/schools/<int:school_id>', methods=['GET'])
def get_school(school_id):
    school = School.query.get_or_404(school_id)
    return jsonify(serialize_school(school)), 200

@school_bp.route('/schools', methods=['POST'])
def create_school():
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    required_fields = ["name", "created_by"]
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")

    dt_value = parse_iso_datetime(data.get('created_at'))
    if data.get('created_at') and not dt_value:
        abort(400, "Invalid created_at format. Must be ISO8601.")
    if not dt_value:
        dt_value = datetime.utcnow()

    new_school = School(
        name=data["name"],
        created_by=data["created_by"],
        created_at=dt_value
    )
    db.session.add(new_school)
    db.session.commit()
    return jsonify(serialize_school(new_school)), 201

@school_bp.route('/schools/<int:school_id>', methods=['PUT'])
def update_school(school_id):
    school = School.query.get_or_404(school_id)
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")

    if "name" in data:
        school.name = data["name"]
    if "created_by" in data:
        school.created_by = data["created_by"]
    if "created_at" in data:
        dt_value = parse_iso_datetime(data["created_at"])
        if data["created_at"] and not dt_value:
            abort(400, "Invalid created_at format. Must be ISO8601.")
        school.created_at = dt_value if dt_value else school.created_at

    db.session.commit()
    return jsonify(serialize_school(school)), 200

@school_bp.route('/schools/<int:school_id>', methods=['DELETE'])
def delete_school(school_id):
    school = School.query.get_or_404(school_id)
    db.session.delete(school)
    db.session.commit()
    return jsonify({"message": "School deleted successfully"}), 200
