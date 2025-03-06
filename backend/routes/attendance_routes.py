from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Attendance, User
from datetime import datetime

attendance_bp = Blueprint('attendance_bp', __name__)

@attendance_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_attendance():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    page = request.args.get('page', 1, type=int)
    attendance_paginated = Attendance.query.filter_by(school_id=user.school_id).paginate(page=page, per_page=10)
    records = [{
        "id": att.id,
        "class_id": att.class_id,
        "student_id": att.student_id,
        "date": att.date.isoformat(),
        "status": att.status,
        "signed_by": att.signed_by
    } for att in attendance_paginated.items]
    return jsonify({
        "attendance": records,
        "total": attendance_paginated.total,
        "pages": attendance_paginated.pages,
        "current_page": attendance_paginated.page
    }), 200

@attendance_bp.route('/attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    required_fields = ('class_id', 'student_id', 'status')
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "class_id, student_id, and status are required"}), 400

    new_attendance = Attendance(
        class_id=data['class_id'],
        student_id=data['student_id'],
        status=data['status'],
        signed_by=user.id,
        date=datetime.utcnow(),
        school_id=user.school_id
    )
    db.session.add(new_attendance)
    db.session.commit()
    return jsonify({"msg": "Attendance marked", "id": new_attendance.id}), 201

@attendance_bp.route('/attendance/<int:attendance_id>', methods=['PUT'])
@jwt_required()
def update_attendance(attendance_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    attendance = Attendance.query.get_or_404(attendance_id)
    if attendance.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to update attendance for this school"}), 403
    if attendance.signed_by != user.id:
        return jsonify({"msg": "You can only update attendance records you marked"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400
    if 'status' in data:
        attendance.status = data['status']
    db.session.commit()
    return jsonify({"msg": "Attendance updated"}), 200

@attendance_bp.route('/attendance/<int:attendance_id>', methods=['DELETE'])
@jwt_required()
def delete_attendance(attendance_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    attendance = Attendance.query.get_or_404(attendance_id)
    if attendance.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to delete attendance for this school"}), 403
    if attendance.signed_by != user.id:
        return jsonify({"msg": "You can only delete attendance records you marked"}), 403

    db.session.delete(attendance)
    db.session.commit()
    return jsonify({"msg": "Attendance deleted"}), 200