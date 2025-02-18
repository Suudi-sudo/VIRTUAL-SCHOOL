# attendance_route.py

from flask import Blueprint, request, jsonify, abort
from datetime import datetime
from models import db, Attendance

attendance_bp = Blueprint('attendance_bp', __name__)

def serialize_attendance(attendance):
    return {
        "id": attendance.id,
        "class_id": attendance.class_id,
        "student_id": attendance.student_id,
        "date": attendance.date.isoformat() if attendance.date else None,
        "status": attendance.status,
        "signed_by": attendance.signed_by
    }

def parse_iso_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str)
    except ValueError:
        return None

@attendance_bp.route('/attendances', methods=['GET'])
def get_attendances():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = Attendance.query.paginate(page=page, per_page=per_page, error_out=False)

    attendances_data = [serialize_attendance(a) for a in pagination.items]

    return jsonify({
        "attendances": attendances_data,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200

@attendance_bp.route('/attendances/<int:attendance_id>', methods=['GET'])
def get_attendance(attendance_id):
    attendance = Attendance.query.get_or_404(attendance_id)
    return jsonify(serialize_attendance(attendance)), 200

@attendance_bp.route('/attendances', methods=['POST'])
def create_attendance():
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    required_fields = ["class_id", "student_id", "status", "signed_by"]
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")

    date_value = parse_iso_date(data.get('date'))
    if data.get('date') and not date_value:
        abort(400, "Invalid date format. Must be ISO8601.")
    if not date_value:
        date_value = datetime.utcnow()

    new_attendance = Attendance(
        class_id=data["class_id"],
        student_id=data["student_id"],
        status=data["status"],
        signed_by=data["signed_by"],
        date=date_value
    )
    db.session.add(new_attendance)
    db.session.commit()

    return jsonify(serialize_attendance(new_attendance)), 201

@attendance_bp.route('/attendances/<int:attendance_id>', methods=['PUT'])
def update_attendance(attendance_id):
    attendance = Attendance.query.get_or_404(attendance_id)
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")

    if "class_id" in data:
        attendance.class_id = data["class_id"]
    if "student_id" in data:
        attendance.student_id = data["student_id"]
    if "status" in data:
        attendance.status = data["status"]
    if "signed_by" in data:
        attendance.signed_by = data["signed_by"]
    if "date" in data:
        date_value = parse_iso_date(data["date"])
        if data["date"] and not date_value:
            abort(400, "Invalid date format. Must be ISO8601.")
        attendance.date = date_value if date_value else attendance.date

    db.session.commit()
    return jsonify(serialize_attendance(attendance)), 200

@attendance_bp.route('/attendances/<int:attendance_id>', methods=['DELETE'])
def delete_attendance(attendance_id):
    attendance = Attendance.query.get_or_404(attendance_id)
    db.session.delete(attendance)
    db.session.commit()
    return jsonify({"message": "Attendance record deleted successfully"}), 200
