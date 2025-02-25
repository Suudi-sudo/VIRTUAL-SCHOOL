from datetime import datetime
from models import db, Exam



class ExamService:
    @staticmethod
    def create_exam(data):
        new_exam = Exam(
            class_id=data['class_id'],
            exam_title=data['exam_title'],
            start_time=datetime.strptime(data['start_time'], '%Y-%m-%d %H:%M:%S'),
            duration_minutes=data['duration_minutes'],
            status='upcoming'
        )
        db.session.add(new_exam)
        db.session.commit()
        return new_exam

    @staticmethod
    def submit_exam(exam_id, student_id, answers_json):
        new_submission = Exam(
            exam_id=exam_id,
            student_id=student_id,
            answers_json=answers_json
        )
        db.session.add(new_submission)
        db.session.commit()
        return new_submission

    @staticmethod
    def get_exam(exam_id):
        return Exam.query.get_or_404(exam_id)