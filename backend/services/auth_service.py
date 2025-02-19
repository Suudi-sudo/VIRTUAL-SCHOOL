from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db
from models.user import User

class AuthService:
    @staticmethod
    def register_user(data):
        hashed_password = generate_password_hash(data['password'])
        new_user = User(name=data['name'], email=data['email'], password_hash=hashed_password, role=data['role'], school_id=data['school_id'])
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def login_user(data):
        user = User.query.filter_by(email=data['email']).first()
        if user and check_password_hash(user.password_hash, data['password']):
            access_token = create_access_token(identity=user.id)
            return access_token
        return None