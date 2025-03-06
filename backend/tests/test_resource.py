import pytest
import os
from flask import Flask, jsonify
from flask.testing import FlaskClient
from flask_jwt_extended import create_access_token, JWTManager
from models import User, Resource, db
from app import create_app  # Assuming you have a create_app function in your app.py

# Configuration for testing
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16 MB

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    # Ensure the upload directory exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def jwt_token(app):
    with app.app_context():
        # Create a test user
        user = User(username='testuser', email='test@example.com', role='Educator', school_id=1)
        user.set_password('password')
        db.session.add(user)
        db.session.commit()

        # Generate a JWT token for the test user
        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
        return access_token

@pytest.fixture
def test_file():
    # Create a dummy test file
    file_path = os.path.join(UPLOAD_FOLDER, 'testfile.pdf')
    with open(file_path, 'wb') as f:
        f.write(b'This is a test file.')
    yield file_path
    # Clean up after the test
    if os.path.exists(file_path):
        os.remove(file_path)

def test_get_resources(client, jwt_token):
    # Add a test resource
    resource = Resource(
        class_id=1,
        uploaded_by=1,
        file_url='http://127.0.0.1:5000/uploads/testfile.pdf',
        description='Test resource',
        permissions='public',
        school_id=1
    )
    db.session.add(resource)
    db.session.commit()

    # Fetch resources
    response = client.get('/resources', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert len(response.json['resources']) == 1
    assert response.json['resources'][0]['description'] == 'Test resource'

def test_upload_resource(client, jwt_token, test_file):
    # Upload a resource
    with open(test_file, 'rb') as f:
        response = client.post('/resources/upload', data={
            'file': f,
            'class_id': 1,
            'permissions': 'public',
            'description': 'Test upload'
        }, headers={
            'Authorization': f'Bearer {jwt_token}'
        })
    assert response.status_code == 201
    assert response.json['msg'] == 'Resource uploaded successfully'

    # Verify the resource was created
    resource = Resource.query.first()
    assert resource.description == 'Test upload'

def test_get_resource(client, jwt_token):
    # Add a test resource
    resource = Resource(
        class_id=1,
        uploaded_by=1,
        file_url='http://127.0.0.1:5000/uploads/testfile.pdf',
        description='Test resource',
        permissions='public',
        school_id=1
    )
    db.session.add(resource)
    db.session.commit()

    # Fetch the resource
    response = client.get(f'/resources/{resource.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['description'] == 'Test resource'

def test_update_resource(client, jwt_token):
    # Add a test resource
    resource = Resource(
        class_id=1,
        uploaded_by=1,
        file_url='http://127.0.0.1:5000/uploads/testfile.pdf',
        description='Test resource',
        permissions='public',
        school_id=1
    )
    db.session.add(resource)
    db.session.commit()

    # Update the resource
    response = client.put(f'/resources/{resource.id}', json={
        'description': 'Updated description',
        'permissions': 'private'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Resource updated'

    # Verify the resource was updated
    updated_resource = Resource.query.get(resource.id)
    assert updated_resource.description == 'Updated description'
    assert updated_resource.permissions == 'private'

def test_delete_resource(client, jwt_token, test_file):
    # Add a test resource
    resource = Resource(
        class_id=1,
        uploaded_by=1,
        file_url='http://127.0.0.1:5000/uploads/testfile.pdf',
        description='Test resource',
        permissions='public',
        school_id=1
    )
    db.session.add(resource)
    db.session.commit()

    # Delete the resource
    response = client.delete(f'/resources/{resource.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Resource deleted'

    # Verify the resource was deleted
    deleted_resource = Resource.query.get(resource.id)
    assert deleted_resource is None

    # Verify the file was deleted
    assert not os.path.exists(test_file)