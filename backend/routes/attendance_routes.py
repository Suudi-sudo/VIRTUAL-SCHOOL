from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required
from models import db, Attendance
from datetime import datetime

attendance_bp = Blueprint('attendance_bp', __name__)

@attendance_bp.route('/attendance', methods=['GET'])
def get_attendance():
    page = request.args.get('page', 1, type=int)
    attendance_paginated = Attendance.query.paginate(page=page, per_page=10)
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
def mark_attendance():
    data = request.get_json()
    if not data or not all(k in data for k in ('class_id', 'student_id', 'status', 'signed_by')):
        return jsonify({"msg": "class_id, student_id, status, and signed_by required"}), 400
    new_attendance = Attendance(
        class_id=data['class_id'],
        student_id=data['student_id'],
        status=data['status'],
        signed_by=data['signed_by'],
        date=datetime.utcnow()
    )
    db.session.add(new_attendance)
    db.session.commit()
    return jsonify({"msg": "Attendance marked", "id": new_attendance.id}), 201

@attendance_bp.route('/attendance/<int:attendance_id>', methods=['PUT'])
def update_attendance(attendance_id):
    attendance = Attendance.query.get_or_404(attendance_id)
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400
    if 'status' in data:
        attendance.status = data['status']
    db.session.commit()
    return jsonify({"msg": "Attendance updated"}), 200

@attendance_bp.route('/attendance/<int:attendance_id>', methods=['DELETE'])
def delete_attendance(attendance_id):
    attendance = Attendance.query.get_or_404(attendance_id)
    db.session.delete(attendance)
    db.session.commit()
    return jsonify({"msg": "Attendance deleted"}), 200
