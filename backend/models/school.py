from datetime import datetime
from models import db

class School(db.Model):
    __tablename__ = 'schools'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('User', back_populates='school')
    classes = db.relationship('Class', backref='school', lazy=True)
    resources = db.relationship('Resource', backref='school', lazy=True)
    exams = db.relationship('Exam', backref='school', lazy=True)
    attendances = db.relationship('Attendance', backref='school', lazy=True)

    def __repr__(self):
        return f'<School {self.name}>'

class Class(db.Model):
    __tablename__ = 'classes'
    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    educator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    students = db.relationship('StudentsClasses', back_populates='class_')
    resources = db.relationship('Resource', backref='class_', lazy=True)
    exams = db.relationship('Exam', backref='class_', lazy=True)
    attendances = db.relationship('Attendance', backref='class_', lazy=True)
    chats = db.relationship('Chat', backref='class_', lazy=True)

    def __repr__(self):
        return f'<Class {self.name}>'

class StudentsClasses(db.Model):
    __tablename__ = 'students_classes'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)

    student = db.relationship('User', backref='students_classes')
    class_ = db.relationship('Class', back_populates='students')

    def __repr__(self):
        return f'<StudentsClasses Student {self.student_id} - Class {self.class_id}>'