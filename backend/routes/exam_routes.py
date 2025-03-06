from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Exam, ExamSubmission, User, Class
from datetime import datetime

exam_bp = Blueprint('exam_bp', __name__)

# Get all exams for the current user's school
@exam_bp.route('/exams', methods=['GET'])
@jwt_required()
def get_exams():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Debugging: Log the school_id being used
    print(f"Fetching exams for school_id: {user.school_id}")

    page = request.args.get('page', 1, type=int)
    exams_paginated = Exam.query.filter_by(school_id=user.school_id).paginate(page=page, per_page=10)
    
    # Debugging: Log the exams being returned
    print(f"Exams found: {exams_paginated.items}")

    exams = [{
        "id": exam.id,
        "class_id": exam.class_id,
        "exam_title": exam.exam_title,
        "start_time": exam.start_time.isoformat(),
        "duration_minutes": exam.duration_minutes,
        "status": exam.status
    } for exam in exams_paginated.items]

    return jsonify({
        "exams": exams,
        "total": exams_paginated.total,
        "pages": exams_paginated.pages,
        "current_page": exams_paginated.page
    }), 200

# Create a new exam (only allowed if the class belongs to the user's school)
@exam_bp.route('/exams', methods=['POST'])
@jwt_required()
def create_exam():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    required_fields = ('class_id', 'exam_title', 'start_time', 'duration_minutes', 'status')
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "class_id, exam_title, start_time, duration_minutes, and status are required"}), 400

    # Verify that the class exists and belongs to the user's school
    target_class = Class.query.get(data['class_id'])
    if not target_class:
        return jsonify({"msg": "Class not found"}), 404
    if target_class.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized: the class does not belong to your school"}), 403

    try:
        start_time = datetime.fromisoformat(data['start_time'])
    except Exception:
        return jsonify({"msg": "Invalid start_time format"}), 400

    # Debugging: Log the exam being created
    print(f"Creating exam for school_id: {user.school_id}")

    new_exam = Exam(
        class_id=data['class_id'],
        exam_title=data['exam_title'],
        start_time=start_time,
        duration_minutes=data['duration_minutes'],
        status=data['status'],
        school_id=user.school_id  # Ensure school_id is set
    )
    db.session.add(new_exam)
    db.session.commit()

    return jsonify({"msg": "Exam created", "id": new_exam.id}), 201

# Get a specific exam (only if it belongs to the user's school)
@exam_bp.route('/exams/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_exam(exam_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    exam = Exam.query.get_or_404(exam_id)
    if exam.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to view this exam"}), 403

    # Debugging: Log the exam being accessed
    print(f"Accessing exam {exam_id} for school_id: {user.school_id}")

    return jsonify({
        "id": exam.id,
        "class_id": exam.class_id,
        "exam_title": exam.exam_title,
        "start_time": exam.start_time.isoformat(),
        "duration_minutes": exam.duration_minutes,
        "status": exam.status
    }), 200

# Update a specific exam (only if it belongs to the user's school)
@exam_bp.route('/exams/<int:exam_id>', methods=['PUT'])
@jwt_required()
def update_exam(exam_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    exam = Exam.query.get_or_404(exam_id)
    if exam.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to update this exam"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400

    # Debugging: Log the exam being updated
    print(f"Updating exam {exam_id} for school_id: {user.school_id}")

    if 'exam_title' in data:
        exam.exam_title = data['exam_title']
    if 'start_time' in data:
        try:
            exam.start_time = datetime.fromisoformat(data['start_time'])
        except Exception:
            return jsonify({"msg": "Invalid start_time format"}), 400
    if 'duration_minutes' in data:
        exam.duration_minutes = data['duration_minutes']
    if 'status' in data:
        exam.status = data['status']

    db.session.commit()
    return jsonify({"msg": "Exam updated"}), 200

# Delete a specific exam (only if it belongs to the user's school)
@exam_bp.route('/exams/<int:exam_id>', methods=['DELETE'])
@jwt_required()
def delete_exam(exam_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    exam = Exam.query.get_or_404(exam_id)
    if exam.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized to delete this exam"}), 403

    # Debugging: Log the exam being deleted
    print(f"Deleting exam {exam_id} for school_id: {user.school_id}")

    db.session.delete(exam)
    db.session.commit()
    return jsonify({"msg": "Exam deleted"}), 200