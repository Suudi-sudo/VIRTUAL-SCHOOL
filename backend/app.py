import os
from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv  # ✅ Load .env variables

# ✅ Load environment variables from .env file
load_dotenv()

# ✅ Initialize Extensions (without app first)
mail = Mail()
migrate = Migrate()

def create_app():
    """Factory function to create and configure the Flask app."""
    app = Flask(__name__)

    # ✅ Force SQLite for Now
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///school_management.db"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # ✅ JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "fallback_secret_key")

    # ✅ Mail Configuration
    app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))
    app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS", "True").lower() in ['true', '1']
    app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME", "")
    app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD", "")
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER", "noreply@example.com")

    # ✅ Import db & models here (AFTER app is created)
    from models import db  # ✅ Import db from models
    db.init_app(app)  # ✅ Initialize db correctly

    mail.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)

    # ✅ Debugging Print
    print(f"\n✅ Running with Database: {app.config['SQLALCHEMY_DATABASE_URI']}\n")

    # ✅ Import Blueprints AFTER App Initialization (to avoid circular imports)
    from routes.user_routes import user_bp
    from routes.school_routes import school_bp
    from routes.attendance_routes import attendance_bp
    from routes.resource_routes import resource_bp
    from routes.exam_routes import exam_bp
    from routes.chat_routes import chat_bp

    # ✅ Register Blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(school_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(resource_bp)
    app.register_blueprint(exam_bp)
    app.register_blueprint(chat_bp)

    return app

# ✅ Create Flask App
app = create_app()

# ✅ Run Flask App
if __name__ == '__main__':
    app.run(debug=True)
