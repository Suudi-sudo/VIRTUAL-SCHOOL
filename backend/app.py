import os
from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import cloudinary
from dotenv import load_dotenv  


load_dotenv()


mail = Mail()
migrate = Migrate()

def create_app():
    """Factory function to create and configure the Flask app."""
    app = Flask(__name__)

    
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///school_management.db"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "fallback_secret_key")

    app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
    app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT"))
    app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS").lower() in ['true', '1']
    app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
    app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER")

    cloudinary.config(
        cloud_name=os.getenv("CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET")
    )

    from models import db  
    db.init_app(app)  

    mail.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)

    
    print("\n✅ Environment Variables Loaded:")
    print(f"  Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"  Mail Server: {app.config['MAIL_SERVER']}")
    print(f"  Cloudinary: {os.getenv('CLOUD_NAME')}\n")

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
