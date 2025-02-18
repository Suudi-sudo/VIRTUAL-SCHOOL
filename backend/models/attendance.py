from datetime import datetime
from models import db

class Attendance(db.Model):
    __tablename__ = 'attendances'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False)  # 'present', 'absent'
    signed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    class_ = db.relationship('Class', back_populates='attendances')
    student = db.relationship('User', backref='attendances_as_student')
    educator = db.relationship('User', backref='attendances_as_educator')

    def __repr__(self):
        return f'<Attendance {self.date} - Student {self.student_id} - Educator {self.signed_by}>'