from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Resource
import os
from werkzeug.utils import secure_filename
from datetime import datetime

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

# ✅ Get All Resources (Paginated)
@resource_bp.route('/resources', methods=['GET'])
@jwt_required()
def get_resources():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    resources_paginated = Resource.query.paginate(page=page, per_page=per_page, error_out=False)

    resources = [{
        "id": res.id,
        "class_id": res.class_id,
        "uploaded_by": res.uploaded_by,
        "file_url": res.file_url,
        "description": res.description,
        "permissions": res.permissions,
        "created_at": res.created_at.isoformat() if res.created_at else None
    } for res in resources_paginated.items]

    return jsonify({
        "resources": resources,
        "total": resources_paginated.total,
        "pages": resources_paginated.pages,
        "current_page": resources_paginated.page
    }), 200

# ✅ Upload Resource
@resource_bp.route('/resources/upload', methods=['POST'])
@jwt_required()
def upload_resource():
    # Debugging: Log request data
    print("Request files:", request.files)
    print("Request form data:", request.form)

    # Validate file presence
    if 'file' not in request.files:
        return jsonify({"msg": "No file provided"}), 400

    file = request.files['file']
    data = request.form

    # Validate file
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"msg": "Invalid file type"}), 400
    if not validate_file_size(file):
        return jsonify({"msg": "File size exceeds the allowed limit (16 MB)"}), 400

    # Validate required form fields
    class_id = data.get('class_id')
    permissions = data.get('permissions')
    if not class_id or not permissions:
        return jsonify({"msg": "class_id and permissions are required"}), 400

    # Secure file name and save it
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Create new Resource instance
    new_resource = Resource(
        class_id=class_id,
        uploaded_by=get_jwt_identity(),
        file_url=file_path,
        description=data.get('description', ''),
        permissions=permissions,
        created_at=datetime.utcnow()  # Add timestamp
    )

    db.session.add(new_resource)
    db.session.commit()

    return jsonify({
        "msg": "Resource uploaded successfully",
        "id": new_resource.id,
        "file_url": new_resource.file_url
    }), 201

# ✅ Get Single Resource by ID
@resource_bp.route('/resources/<int:resource_id>', methods=['GET'])
@jwt_required()
def get_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    return jsonify({
        "id": res.id,
        "class_id": res.class_id,
        "uploaded_by": res.uploaded_by,
        "file_url": res.file_url,
        "description": res.description,
        "permissions": res.permissions,
        "created_at": res.created_at.isoformat() if res.created_at else None
    }), 200

# ✅ Update Resource (Only Description & Permissions)
@resource_bp.route('/resources/<int:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    data = request.get_json()

    if not data:
        return jsonify({"msg": "No input provided"}), 400

    # Validate permissions (optional: ensure only the owner can update)
    if res.uploaded_by != get_jwt_identity():
        return jsonify({"msg": "Unauthorized: You do not own this resource"}), 403

    # Update fields
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

# ✅ Delete a Resource
@resource_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)

    # Validate permissions (optional: ensure only the owner can delete)
    if res.uploaded_by != get_jwt_identity():
        return jsonify({"msg": "Unauthorized: You do not own this resource"}), 403

    # Delete the file from the filesystem
    if os.path.exists(res.file_url):
        os.remove(res.file_url)

    try:
        db.session.delete(res)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Delete failed: {str(e)}"}), 500

    return jsonify({"msg": "Resource deleted"}), 200