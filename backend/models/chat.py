from datetime import datetime
from models import db

class Chat(db.Model):
    __tablename__ = 'chats'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    class_ = db.relationship('Class', back_populates='chats')
    sender = db.relationship('User', backref='chats')

    def __repr__(self):
        return f'<Chat {self.message[:20]}>'