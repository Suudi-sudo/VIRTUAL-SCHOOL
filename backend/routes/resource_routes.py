from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Resource
from datetime import datetime
import os
from werkzeug.utils import secure_filename

resource_bp = Blueprint('resource_bp', __name__)

# Create the 'uploads' directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ✅ Get All Resources (Paginated)
@resource_bp.route('/resources', methods=['GET'])
@jwt_required()
def get_resources():
    page = request.args.get('page', 1, type=int)
    per_page = 10

    resources_paginated = Resource.query.paginate(page=page, per_page=per_page, error_out=False)

    resources = [{
        "id": res.id,
        "class_id": res.class_id,
        "uploaded_by": res.uploaded_by,
        "file_url": res.file_url,
        "description": res.description,
        "permissions": res.permissions
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
    print("Request files:", request.files)
    print("Request form data:", request.form)

    if 'file' not in request.files:
        return jsonify({"msg": "No file provided"}), 400

    file = request.files['file']
    data = request.form

    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"msg": "Invalid file type"}), 400

    # Ensure required form fields are present
    class_id = data.get('class_id')
    permissions = data.get('permissions')
    if not class_id or not permissions:
        return jsonify({"msg": "class_id and permissions are required"}), 400

    # Secure file name and save it
    filename = secure_filename(file.filename)
    upload_dir = 'uploads'
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    # Create new Resource instance
    new_resource = Resource(
        class_id=class_id,
        uploaded_by=get_jwt_identity(),
        file_url=file_path,
        description=data.get('description', ''),
        permissions=permissions
    )

    db.session.add(new_resource)
    db.session.commit()

    return jsonify({"msg": "Resource uploaded successfully", "id": new_resource.id}), 201

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
        "permissions": res.permissions
    }), 200

# ✅ Update Resource (Only Description & Permissions)
@resource_bp.route('/resources/<int:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
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

# ✅ Delete a Resource
@resource_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)

    try:
        db.session.delete(res)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Delete failed: {str(e)}"}), 500

    return jsonify({"msg": "Resource deleted"}), 200
