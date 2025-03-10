import os
import json
import random
import string
from flask import Flask, redirect, request, session, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
import cloudinary
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from werkzeug.security import generate_password_hash
from flask_socketio import SocketIO
from models import db, User  # Ensure User model is imported

# Load environment variables
load_dotenv()

# Initialize extensions
mail = Mail()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    """Factory function to create and configure the Flask app."""
    app = Flask(__name__)

    # Set SECRET_KEY to avoid session errors
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "fallback_secret_key")

    # Configure database

    app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://virtualschooldb_1nwy_user:lill5TFYQEesayLeLtPG832nSvlOubrK@dpg-cv51g4rtq21c73f0gp20-a.oregon-postgres.render.com/virtualschooldb_1nwy"


    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "fallback_secret_key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

    # Configure mail
    try:
        app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
        app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))
        app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS", "true").lower() in ['true', '1']
        app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
        app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
        app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_DEFAULT_SENDER")
    except Exception as e:
        print(f"⚠️ Mail configuration error: {e}")

    # Configure Cloudinary
    cloudinary.config(
        cloud_name=os.getenv("CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET")
    )

    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)
    socketio.init_app(app)
    CORS(app, supports_credentials=True)

    # Allow insecure transport for local development
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    # Load Google OAuth credentials from environment variable
    client_secrets_json = os.getenv("GOOGLE_CLIENT_SECRET_JSON")

    if not client_secrets_json:
        raise ValueError("⚠️ GOOGLE_CLIENT_SECRET_JSON is missing! Check your .env file.")

    try:
        client_secrets_dict = json.loads(client_secrets_json)
    except json.JSONDecodeError as e:
        raise ValueError(f"⚠️ Error parsing GOOGLE_CLIENT_SECRET_JSON: {e}")

    # Initialize Google OAuth flow
    flow = Flow.from_client_config(
        client_secrets_dict,
        scopes=["https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "openid"],
        redirect_uri="http://127.0.0.1:5000/google_login/callback"
    )

     # Helper function to generate a random password
    def generate_random_password(length=12):
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(characters) for _ in range(length))


    # Default homepage
    @app.route('/')
    def home():
        return jsonify({"message": "Welcome to Virtual School API!"})

    # Google authorization route
    @app.route("/authorize_google")
    def authorize_google():
        try:
            authorization_url, state = flow.authorization_url(prompt='consent')
            session["state"] = state  # Store state in session
            return redirect(authorization_url)
        except Exception as e:
            return f"Error during Google authorization: {str(e)}", 500

    # Google callback route
    @app.route("/google_login/callback")
    def google_callback():
        try:
            flow.fetch_token(authorization_response=request.url)
            credentials = flow.credentials

            user_info_service = build('oauth2', 'v2', credentials=credentials)
            user_info = user_info_service.userinfo().get().execute()

            # Check if the user already exists
            user = User.query.filter_by(email=user_info['email']).first()
            if not user:
                user = User(
                    username=user_info.get('name'),
                    email=user_info['email'],
                    profile_pic=user_info.get('picture'),
                    google_id=user_info.get('sub'),
                    role='admin'
                )
                db.session.add(user)
                db.session.commit()

            session['user_id'] = user.id
            session['user_info'] = user_info
            return redirect("http://localhost:5173/login")
        except Exception as e:
            return f"Error during Google callback: {str(e)}", 500
        
      # Helper function to convert credentials to a dictionary
    def credentials_to_dict(credentials):
        return {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id, 
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
   

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory("uploads", filename)

    # WebSocket Handlers
    @socketio.on('connect')
    def handle_connect():
        print("✅ Client connected")

    @socketio.on('disconnect')
    def handle_disconnect():
        print("❌ Client disconnected")

    @socketio.on('message')
    def handle_message(data):
        print(f"📩 Received message: {data}")
        socketio.emit('response', {'message': 'Message received!'})

    # Test API Route
    @app.route('/test')
    def test_api():
        return jsonify({"message": "CORS & WebSockets are working!"})

    # Print loaded environment variables
    print("\n✅ Environment Variables Loaded:")
    print(f"  Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"  Mail Server: {app.config.get('MAIL_SERVER', 'Not Set')}")
    print(f"  Cloudinary: {os.getenv('CLOUD_NAME', 'Not Set')}\n")

    # Import and register blueprints
    from routes.user_routes import user_bp
    from routes.school_routes import school_bp
    from routes.attendance_routes import attendance_bp
    from routes.resource_routes import resource_bp
    from routes.exam_routes import exam_bp
    from routes.chat_routes import chat_bp
    from routes.class_routes import classes_bp
    from routes.quizes import quiz_bp

    app.register_blueprint(user_bp)
    app.register_blueprint(school_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(resource_bp)
    app.register_blueprint(exam_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(quiz_bp)

    return app

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)  # Run with SocketIO
