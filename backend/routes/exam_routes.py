# exam_routes.py

from flask import Blueprint, request, jsonify, abort
from datetime import datetime, timedelta
from models import db, Exam, ExamSubmission

exam_bp = Blueprint('exam_bp', __name__)

def serialize_exam(exam):
    return {
        "id": exam.id,
        "class_id": exam.class_id,
        "exam_title": exam.exam_title,
        "start_time": exam.start_time.isoformat() if exam.start_time else None,
        "duration_minutes": exam.duration_minutes,
        "status": exam.status
    }

def serialize_exam_submission(submission):
    return {
        "id": submission.id,
        "exam_id": submission.exam_id,
        "student_id": submission.student_id,
        "answers_json": submission.answers_json,
        "score": submission.score
    }

def parse_iso_datetime(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except ValueError:
        return None

# ---------------------------------------------------------------------------
# EXAM ROUTES
# ---------------------------------------------------------------------------

@exam_bp.route('/exams', methods=['GET'])
def get_exams():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = Exam.query.paginate(page=page, per_page=per_page, error_out=False)

    exams_data = [serialize_exam(e) for e in pagination.items]
    return jsonify({
        "exams": exams_data,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200

@exam_bp.route('/exams/<int:exam_id>', methods=['GET'])
def get_exam(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    return jsonify(serialize_exam(exam)), 200

@exam_bp.route('/exams', methods=['POST'])
def create_exam():
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    required_fields = ["class_id", "exam_title", "start_time", "duration_minutes", "status"]
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")
    dt_value = parse_iso_datetime(data["start_time"])
    if not dt_value:
        abort(400, "Invalid or missing start_time (must be ISO8601).")

    new_exam = Exam(
        class_id=data["class_id"],
        exam_title=data["exam_title"],
        start_time=dt_value,
        duration_minutes=data["duration_minutes"],
        status=data["status"]
    )
    db.session.add(new_exam)
    db.session.commit()
    return jsonify(serialize_exam(new_exam)), 201

@exam_bp.route('/exams/<int:exam_id>', methods=['PUT'])
def update_exam(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")

    if "class_id" in data:
        exam.class_id = data["class_id"]
    if "exam_title" in data:
        exam.exam_title = data["exam_title"]
    if "start_time" in data:
        dt_value = parse_iso_datetime(data["start_time"])
        if not dt_value:
            abort(400, "Invalid start_time (must be ISO8601).")
        exam.start_time = dt_value
    if "duration_minutes" in data:
        exam.duration_minutes = data["duration_minutes"]
    if "status" in data:
        exam.status = data["status"]

    db.session.commit()
    return jsonify(serialize_exam(exam)), 200

@exam_bp.route('/exams/<int:exam_id>', methods=['DELETE'])
def delete_exam(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    db.session.delete(exam)
    db.session.commit()
    return jsonify({"message": "Exam deleted successfully"}), 200

# ---------------------------------------------------------------------------
# EXAM SUBMISSIONS ROUTES
# ---------------------------------------------------------------------------

@exam_bp.route('/exams/<int:exam_id>/submissions', methods=['GET'])
def get_exam_submissions(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Filter submissions by this exam_id
    query = ExamSubmission.query.filter_by(exam_id=exam_id)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    submissions_data = [serialize_exam_submission(s) for s in pagination.items]
    return jsonify({
        "submissions": submissions_data,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages
    }), 200

@exam_bp.route('/exams/<int:exam_id>/submissions/<int:submission_id>', methods=['GET'])
def get_exam_submission(exam_id, submission_id):
    exam = Exam.query.get_or_404(exam_id)
    submission = next((s for s in exam.submissions if s.id == submission_id), None)
    if not submission:
        abort(404, "Submission not found for this exam")
    return jsonify(serialize_exam_submission(submission)), 200

@exam_bp.route('/exams/<int:exam_id>/submissions', methods=['POST'])
def create_exam_submission(exam_id):
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    required_fields = ["student_id", "answers_json"]
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")

    new_submission = ExamSubmission(
        exam_id=exam.id,
        student_id=data["student_id"],
        answers_json=data["answers_json"],
        score=data.get("score")
    )
    db.session.add(new_submission)
    db.session.commit()
    return jsonify(serialize_exam_submission(new_submission)), 201

@exam_bp.route('/exams/<int:exam_id>/submissions/<int:submission_id>', methods=['PUT'])
def update_exam_submission(exam_id, submission_id):
    exam = Exam.query.get_or_404(exam_id)
    submission = next((s for s in exam.submissions if s.id == submission_id), None)
    if not submission:
        abort(404, "Submission not found for this exam")
    data = request.get_json()
    if not data:
        abort(400, "Missing JSON body")
    if "answers_json" in data:
        submission.answers_json = data["answers_json"]
    if "score" in data:
        submission.score = data["score"]
    db.session.commit()
    return jsonify(serialize_exam_submission(submission)), 200

@exam_bp.route('/exams/<int:exam_id>/submissions/<int:submission_id>', methods=['DELETE'])
def delete_exam_submission(exam_id, submission_id):
    exam = Exam.query.get_or_404(exam_id)
    submission = next((s for s in exam.submissions if s.id == submission_id), None)
    if not submission:
        abort(404, "Submission not found for this exam")
    db.session.delete(submission)
    db.session.commit()
    return jsonify({"message": "Exam submission deleted successfully"}), 200
