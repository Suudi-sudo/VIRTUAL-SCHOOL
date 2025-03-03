from flask import Blueprint, request, jsonify, abort
from models import db, Class

classes_bp = Blueprint('classes', __name__)

@classes_bp.route('/classes', methods=['GET'])
def get_classes():
    """
    Retrieve a list of classes.
    Optionally filter by school_id by passing ?school_id=<id> as a query parameter.
    """
    school_id = request.args.get('school_id')
    query = Class.query
    if school_id:
        query = query.filter_by(school_id=school_id)
    classes = query.all()
    classes_data = [{
        'id': cls.id,
        'school_id': cls.school_id,
        'name': cls.name,
        'educator_id': cls.educator_id
    } for cls in classes]
    return jsonify(classes_data), 200

@classes_bp.route('/classes/<int:class_id>', methods=['GET'])
def get_class(class_id):
    """
    Retrieve details for a single class.
    """
    cls = Class.query.get_or_404(class_id)
    class_data = {
        'id': cls.id,
        'school_id': cls.school_id,
        'name': cls.name,
        'educator_id': cls.educator_id
    }
    return jsonify(class_data), 200

@classes_bp.route('/classes', methods=['POST'])
def create_class():
    """
    Create a new class.
    Expected JSON body:
    {
      "school_id": <int>,
      "name": <string>,
      "educator_id": <int>
    }
    """
    data = request.get_json() or {}
    required_fields = ['school_id', 'name', 'educator_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    new_class = Class(
        school_id=data['school_id'],
        name=data['name'],
        educator_id=data['educator_id']
    )
    db.session.add(new_class)
    db.session.commit()

    return jsonify({
        'id': new_class.id,
        'school_id': new_class.school_id,
        'name': new_class.name,
        'educator_id': new_class.educator_id
    }), 201

@classes_bp.route('/classes/<int:class_id>', methods=['PUT'])
def update_class(class_id):
    """
    Update an existing class.
    Expected JSON body can include any of:
    {
      "school_id": <int>,
      "name": <string>,
      "educator_id": <int>
    }
    """
    cls = Class.query.get_or_404(class_id)
    data = request.get_json() or {}

    if 'school_id' in data:
        cls.school_id = data['school_id']
    if 'name' in data:
        cls.name = data['name']
    if 'educator_id' in data:
        cls.educator_id = data['educator_id']

    db.session.commit()
    return jsonify({
        'id': cls.id,
        'school_id': cls.school_id,
        'name': cls.name,
        'educator_id': cls.educator_id
    }), 200

@classes_bp.route('/classes/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    """
    Delete a class by its ID.
    """
    cls = Class.query.get_or_404(class_id)
    db.session.delete(cls)
    db.session.commit()
    return jsonify({'message': 'Class deleted successfully'}), 200