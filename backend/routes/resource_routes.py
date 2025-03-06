import os
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime
from models import db, Resource, User  # Import User model to get full user object

# Initialize Blueprint
resource_bp = Blueprint('resource_bp', __name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16 MB

# Ensure the upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file_size(file):
    """Check if the file size is within the allowed limit."""
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer
    return file_size <= MAX_FILE_SIZE

# Serve Uploaded Files
@resource_bp.route('/uploads/<filename>', methods=['GET'])
def serve_file(filename):
    """Serve files from the UPLOAD_FOLDER."""
    return send_from_directory(UPLOAD_FOLDER, filename)

# Get All Resources (Paginated) - restricted by school
@resource_bp.route('/resources', methods=['GET'])
@jwt_required()
def get_resources():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    user_id = get_jwt_identity()
    user = User.query.get(user_id)  # Fetch full user object

    if not user:
        return jsonify({"msg": "User not found"}), 404

    user_school_id = user.school_id  # Fetch the correct school_id

    resources_paginated = Resource.query.filter(Resource.school_id == user_school_id) \
        .paginate(page=page, per_page=per_page, error_out=False)

    resources = [{
        "id": res.id,
        "class_id": res.class_id,
        "uploaded_by": res.uploaded_by,
        "file_url": f"http://127.0.0.1:5000/uploads/{os.path.basename(res.file_url)}",
        "description": res.description,
        "permissions": res.permissions,
    } for res in resources_paginated.items]

    return jsonify({
        "resources": resources,
        "total": resources_paginated.total,
        "pages": resources_paginated.pages,
        "current_page": resources_paginated.page
    }), 200

# Upload Resource - associate with the user's school
@resource_bp.route('/resources/upload', methods=['POST'])
@jwt_required()
def upload_resource():
    if 'file' not in request.files:
        return jsonify({"msg": "No file provided"}), 400

    file = request.files['file']
    data = request.form

    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"msg": "Invalid file type"}), 400
    if not validate_file_size(file):
        return jsonify({"msg": "File size exceeds the allowed limit (16 MB)"}), 400

    class_id = data.get('class_id')
    permissions = data.get('permissions')
    if not class_id or not permissions:
        return jsonify({"msg": "class_id and permissions are required"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    file_url = f"http://127.0.0.1:5000/uploads/{filename}"

    new_resource = Resource(
        class_id=class_id,
        uploaded_by=user.id,
        file_url=file_url,
        description=data.get('description', ''),
        permissions=permissions,
        school_id=user.school_id,
        # created_at=datetime.utcnow()
    )

    db.session.add(new_resource)
    db.session.commit()

    return jsonify({
        "msg": "Resource uploaded successfully",
        "id": new_resource.id,
        "file_url": new_resource.file_url
    }), 201

# Get Single Resource by ID - restricted by school
@resource_bp.route('/resources/<int:resource_id>', methods=['GET'])
@jwt_required()
def get_resource(resource_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    res = Resource.query.get_or_404(resource_id)

    if res.school_id != user.school_id:
        return jsonify({"msg": "Unauthorized: You do not have access to this resource"}), 403

    return jsonify({
        "id": res.id,
        "class_id": res.class_id,
        "uploaded_by": res.uploaded_by,
        "file_url": res.file_url,
        "description": res.description,
        "permissions": res.permissions,
    }), 200

# Update Resource (Only Description & Permissions) - restricted by school and uploader
@resource_bp.route('/resources/<int:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    if res.school_id != user.school_id or res.uploaded_by != user.id:
        return jsonify({"msg": "Unauthorized: You do not have access to update this resource"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400

    if 'description' in data:
        res.description = data['description']
    if 'permissions' in data:
        res.permissions = data['permissions']

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Update failed: {str(e)}"}), 500

    return jsonify({"msg": "Resource updated"}), 200

# Delete a Resource - restricted by school and uploader
@resource_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    if res.school_id != user.school_id or res.uploaded_by != user.id:
        return jsonify({"msg": "Unauthorized: You do not have access to delete this resource"}), 403

    file_path = os.path.join(UPLOAD_FOLDER, os.path.basename(res.file_url))
    if os.path.exists(file_path):
        os.remove(file_path)

    try:
        db.session.delete(res)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Delete failed: {str(e)}"}), 500

    return jsonify({"msg": "Resource deleted"}), 200
