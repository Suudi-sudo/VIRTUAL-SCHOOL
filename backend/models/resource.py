from datetime import datetime
from models import db

class Resource(db.Model):
    __tablename__ = 'resources'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    class_ = db.relationship('Class', back_populates='resources')
    educator = db.relationship('User', backref='resources')

    def __repr__(self):
        return f'<Resource {self.file_url}>'