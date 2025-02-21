from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Exam, ExamSubmission
from datetime import datetime, timedelta

exam_bp = Blueprint('exam_bp', __name__)

@exam_bp.route('/exams', methods=['GET'])
@jwt_required()
def get_exams():
    page = request.args.get('page', 1, type=int)
    exams_paginated = Exam.query.paginate(page=page, per_page=10)
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

@exam_bp.route('/exams', methods=['POST'])
@jwt_required()
def create_exam():
    data = request.get_json()
    if not data or not all(k in data for k in ('class_id', 'exam_title', 'start_time', 'duration_minutes', 'status')):
        return jsonify({"msg": "class_id, exam_title, start_time, duration_minutes, and status required"}), 400
    try:
        start_time = datetime.fromisoformat(data['start_time'])
    except Exception as e:
        return jsonify({"msg": "Invalid start_time format"}), 400
    new_exam = Exam(
        class_id=data['class_id'],
        exam_title=data['exam_title'],
        start_time=start_time,
        duration_minutes=data['duration_minutes'],
        status=data['status']
    )
    db.session.add(new_exam)
    db.session.commit()
    return jsonify({"msg": "Exam created", "id": new_exam.id}), 201

@exam_bp.route('/exams/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_exam(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    return jsonify({
        "id": exam.id,
        "class_id": exam.class_id,
        "exam_title": exam.exam_title,
        "start_time": exam.start_time.isoformat(),
        "duration_minutes": exam.duration_minutes,
        "status": exam.status
    }), 200

@exam_bp.route('/exams/<int:exam_id>', methods=['PUT'])
@jwt_required()
def update_exam(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400
    if 'exam_title' in data:
        exam.exam_title = data['exam_title']
    if 'start_time' in data:
        try:
            exam.start_time = datetime.fromisoformat(data['start_time'])
        except Exception as e:
            return jsonify({"msg": "Invalid start_time format"}), 400
    if 'duration_minutes' in data:
        exam.duration_minutes = data['duration_minutes']
    if 'status' in data:
        exam.status = data['status']
    db.session.commit()
    return jsonify({"msg": "Exam updated"}), 200

@exam_bp.route('/exams/<int:exam_id>', methods=['DELETE'])
@jwt_required()
def delete_exam(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    db.session.delete(exam)
    db.session.commit()
    return jsonify({"msg": "Exam deleted"}), 200

# --- Exam Submission Endpoints ---

@exam_bp.route('/exams/<int:exam_id>/submissions', methods=['GET'])
@jwt_required()
def get_exam_submissions(exam_id):
    page = request.args.get('page', 1, type=int)
    submissions_paginated = ExamSubmission.query.filter_by(exam_id=exam_id).paginate(page=page, per_page=10)
    submissions = [{
        "id": sub.id,
        "student_id": sub.student_id,
        "answers_json": sub.answers_json,
        "score": sub.score
    } for sub in submissions_paginated.items]
    return jsonify({
        "submissions": submissions,
        "total": submissions_paginated.total,
        "pages": submissions_paginated.pages,
        "current_page": submissions_paginated.page
    }), 200

@exam_bp.route('/exams/<int:exam_id>/submissions', methods=['POST'])
@jwt_required()
def create_exam_submission(exam_id):
    data = request.get_json()
    if not data or not all(k in data for k in ('student_id', 'answers_json')):
        return jsonify({"msg": "student_id and answers_json required"}), 400
    new_submission = ExamSubmission(
        exam_id=exam_id,
        student_id=data['student_id'],
        answers_json=data['answers_json'],
        score=data.get('score')
    )
    db.session.add(new_submission)
    db.session.commit()
    return jsonify({"msg": "Submission created", "id": new_submission.id}), 201

@exam_bp.route('/exams/<int:exam_id>/submissions/<int:submission_id>', methods=['PUT'])
@jwt_required()
def update_exam_submission(exam_id, submission_id):
    submission = ExamSubmission.query.filter_by(id=submission_id, exam_id=exam_id).first_or_404()
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400
    if 'answers_json' in data:
        submission.answers_json = data['answers_json']
    if 'score' in data:
        submission.score = data['score']
    db.session.commit()
    return jsonify({"msg": "Submission updated"}), 200

@exam_bp.route('/exams/<int:exam_id>/submissions/<int:submission_id>', methods=['DELETE'])
@jwt_required()
def delete_exam_submission(exam_id, submission_id):
    submission = ExamSubmission.query.filter_by(id=submission_id, exam_id=exam_id).first_or_404()
    db.session.delete(submission)
    db.session.commit()
    return jsonify({"msg": "Submission deleted"}), 200
