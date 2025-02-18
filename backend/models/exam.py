from datetime import datetime
from models import db

class Exam(db.Model):
    __tablename__ = 'exams'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    exam_title = db.Column(db.String(200), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False)  # 'upcoming', 'active', 'completed'

    class_ = db.relationship('Class', back_populates='exams')
    submissions = db.relationship('ExamSubmission', backref='exam', lazy=True)

    def __repr__(self):
        return f'<Exam {self.exam_title}>'
    

class ExamSubmission(db.Model):
    __tablename__ = 'exam_submissions'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    answers_json = db.Column(db.Text, nullable=False)
    score = db.Column(db.Float, nullable=True)

    student = db.relationship('User', backref='exam_submissions')

    def __repr__(self):
        return f'<ExamSubmission Exam {self.exam_id} - Student {self.student_id}>' 

    # jguvyfycvjhgfvhmgv    