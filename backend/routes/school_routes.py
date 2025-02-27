from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required
from models import db, School, Class
from datetime import datetime

school_bp = Blueprint('school_bp', __name__)

@school_bp.route('/schools', methods=['GET'])
@jwt_required()
def get_schools():
    page = request.args.get('page', 1, type=int)
    schools_paginated = School.query.paginate(page=page, per_page=10)
    schools = [{
        "id": s.id,
        "name": s.name,
        "created_by": s.created_by,
        "created_at": s.created_at.isoformat()
    } for s in schools_paginated.items]
    return jsonify({
        "schools": schools,
        "total": schools_paginated.total,
        "pages": schools_paginated.pages,
        "current_page": schools_paginated.page
    }), 200

@school_bp.route('/schools', methods=['POST'])
@jwt_required()
def create_school():
    data = request.get_json()
    if not data or 'name' not in data or 'created_by' not in data:
        return jsonify({"msg": "Name and created_by required"}), 400
    new_school = School(
        name=data['name'],
        created_by=data['created_by'],
        created_at=datetime.utcnow()
    )
    db.session.add(new_school)
    db.session.commit()
    return jsonify({"msg": "School created", "id": new_school.id}), 201

@school_bp.route('/schools/<int:school_id>', methods=['GET'])
@jwt_required()
def get_school(school_id):
    school = School.query.get_or_404(school_id)
    return jsonify({
        "id": school.id,
        "name": school.name,
        "created_by": school.created_by,
        "created_at": school.created_at.isoformat()
    }), 200

@school_bp.route('/schools/<int:school_id>', methods=['PUT'])
@jwt_required()
def update_school(school_id):
    school = School.query.get_or_404(school_id)
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400
    if 'name' in data:
        school.name = data['name']
    db.session.commit()
    return jsonify({"msg": "School updated"}), 200

@school_bp.route('/schools/<int:school_id>', methods=['DELETE'])
@jwt_required()
def delete_school(school_id):
    school = School.query.get_or_404(school_id)
    db.session.delete(school)
    db.session.commit()
    return jsonify({"msg": "School deleted"}), 200

# Nested endpoint: List classes in a school
@school_bp.route('/schools/<int:school_id>/classes', methods=['GET'])
@jwt_required()
def get_school_classes(school_id):
    page = request.args.get('page', 1, type=int)
    classes_paginated = Class.query.filter_by(school_id=school_id).paginate(page=page, per_page=10)
    classes = [{
        "id": cl.id,
        "name": cl.name,
        "educator_id": cl.educator_id
    } for cl in classes_paginated.items]
    return jsonify({
        "classes": classes,
        "total": classes_paginated.total,
        "pages": classes_paginated.pages,
        "current_page": classes_paginated.page
    }), 200

@school_bp.route('/schools/<int:school_id>/classes', methods=['POST'])
@jwt_required()
def create_class_in_school(school_id):
    data = request.get_json()
    if not data or 'name' not in data or 'educator_id' not in data:
        return jsonify({"msg": "Name and educator_id required"}), 400
    new_class = Class(
        school_id=school_id,
        name=data['name'],
        educator_id=data['educator_id']
    )
    db.session.add(new_class)
    db.session.commit()
    return jsonify({"msg": "Class created", "id": new_class.id}), 201



@school_bp.route("/schools/<int:school_id>", methods=["GET"])
@jwt_required()
def get_school_details(school_id):
    """
    Return a single school's info, plus teachers and students in that school.
    """
    school = School.query.get(school_id)
    if not school:
        return jsonify({"msg": "School not found."}), 404

    # Query users with role='educator' or role='student' who belong to this school
    teachers = User.query.filter_by(role="educator", school_id=school_id).all()
    students = User.query.filter_by(role="student", school_id=school_id).all()

    return jsonify({
        "school": {
            "id": school.id,
            "name": school.name,
            "created_by": school.created_by,
            "created_at": school.created_at
            # etc...
        },
        "teachers": [
            {"id": t.id, "username": t.username, "email": t.email} for t in teachers
        ],
        "students": [
            {"id": s.id, "username": s.username, "email": s.email} for s in students
        ]
    }), 200
