import os
from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv  # ✅ Load .env variables

# ✅ Load environment variables from .env file
load_dotenv()

# Import models
from models import db, User, School, Class, StudentsClasses, Attendance, Resource, Exam, ExamSubmission, Chat

app = Flask(__name__)

# ✅ Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///school_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ JWT Configuration
app.config['JWT_SECRET_KEY'] = "default_secret_key"

# ✅ Mail Configuration (from .env file)
app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))  # Convert to int
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS", "True") == "True"  # Convert to bool
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER")

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
mail = Mail(app)

# Debugging Print
print("✅ Using Database:", app.config['SQLALCHEMY_DATABASE_URI'])

# Import and Register Blueprints
from routes.user_routes import user_bp
from routes.school_routes import school_bp
from routes.attendance_routes import attendance_bp
from routes.resource_routes import resource_bp
from routes.exam_routes import exam_bp
from routes.chat_routes import chat_bp

app.register_blueprint(user_bp)
app.register_blueprint(school_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(resource_bp)
app.register_blueprint(exam_bp)
app.register_blueprint(chat_bp)

if __name__ == '__main__':
    app.run(debug=True)
