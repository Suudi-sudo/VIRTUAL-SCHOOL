from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Resource
from datetime import datetime
import os
from werkzeug.utils import secure_filename

resource_bp = Blueprint('resource_bp', __name__)

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
        "permissions": res.permissions  # Added permissions field
    } for res in resources_paginated.items]

    return jsonify({
        "resources": resources,
        "total": resources_paginated.total,
        "pages": resources_paginated.pages,
        "current_page": resources_paginated.page
    }), 200

# ✅ Upload a New Resource (File Upload Support)
@resource_bp.route('/resources/upload', methods=['POST'])
@jwt_required()
def upload_resource():
    if 'file' not in request.files:
        return jsonify({"msg": "No file provided"}), 400

    file = request.files['file']
    data = request.form  # Using form-data instead of JSON

    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"msg": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join('uploads', filename)  # Save in 'uploads' folder
    file.save(file_path)

    if 'class_id' not in data or 'permissions' not in data:
        return jsonify({"msg": "class_id and permissions required"}), 400

    new_resource = Resource(
        class_id=data['class_id'],
        uploaded_by=get_jwt_identity(),  # Get educator from JWT token
        file_url=file_path,
        description=data.get('description', ''),
        permissions=data['permissions']  # Store access control
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
        res.permissions = data['permissions']  # Allow updating access permissions

    db.session.commit()
    return jsonify({"msg": "Resource updated"}), 200

# ✅ Delete a Resource
@resource_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def delete_resource(resource_id):
    res = Resource.query.get_or_404(resource_id)
    db.session.delete(res)
    db.session.commit()
    return jsonify({"msg": "Resource deleted"}), 200
