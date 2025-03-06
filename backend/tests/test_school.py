import pytest
from flask import Flask, jsonify
from flask.testing import FlaskClient
from flask_jwt_extended import create_access_token, JWTManager
from models import School, Class, User, db
from app import create_app  # Assuming you have a create_app function in your app.py

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'

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
        user = User(username='testuser', email='test@example.com', role='Admin')
        user.set_password('password')
        db.session.add(user)
        db.session.commit()

        # Generate a JWT token for the test user
        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
        return access_token

def test_get_schools(client, jwt_token):
    # Add a test school
    school = School(name='Test School', created_at='2023-10-01T10:00:00')
    db.session.add(school)
    db.session.commit()

    # Fetch schools
    response = client.get('/schools', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert len(response.json['schools']) == 1
    assert response.json['schools'][0]['name'] == 'Test School'

def test_create_school(client, jwt_token):
    # Create a new school
    response = client.post('/schools', json={
        'name': 'New School'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 201
    assert response.json['msg'] == 'School created'

    # Verify the school was created
    school = School.query.first()
    assert school.name == 'New School'

def test_get_school(client, jwt_token):
    # Add a test school
    school = School(name='Test School', created_at='2023-10-01T10:00:00')
    db.session.add(school)
    db.session.commit()

    # Add test users (teachers and students)
    teacher = User(username='teacher1', email='teacher@example.com', role='Educator', school_id=school.id)
    student = User(username='student1', email='student@example.com', role='Student', school_id=school.id)
    db.session.add(teacher)
    db.session.add(student)
    db.session.commit()

    # Fetch the school
    response = client.get(f'/schools/{school.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['name'] == 'Test School'
    assert len(response.json['teachers']) == 1
    assert len(response.json['students']) == 1

def test_update_school(client, jwt_token):
    # Add a test school
    school = School(name='Test School', created_at='2023-10-01T10:00:00')
    db.session.add(school)
    db.session.commit()

    # Update the school
    response = client.put(f'/schools/{school.id}', json={
        'name': 'Updated School'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'School updated'

    # Verify the school was updated
    updated_school = School.query.get(school.id)
    assert updated_school.name == 'Updated School'

def test_delete_school(client, jwt_token):
    # Add a test school
    school = School(name='Test School', created_at='2023-10-01T10:00:00')
    db.session.add(school)
    db.session.commit()

    # Delete the school
    response = client.delete(f'/schools/{school.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'School deleted'

    # Verify the school was deleted
    deleted_school = School.query.get(school.id)
    assert deleted_school is None

def test_get_school_classes(client, jwt_token):
    # Add a test school
    school = School(name='Test School', created_at='2023-10-01T10:00:00')
    db.session.add(school)
    db.session.commit()

    # Add a test class
    test_class = Class(name='Test Class', school_id=school.id, educator_id=1)
    db.session.add(test_class)
    db.session.commit()

    # Fetch classes for the school
    response = client.get(f'/schools/{school.id}/classes', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert len(response.json['classes']) == 1
    assert response.json['classes'][0]['name'] == 'Test Class'

def test_create_class_in_school(client, jwt_token):
    # Add a test school
    school = School(name='Test School', created_at='2023-10-01T10:00:00')
    db.session.add(school)
    db.session.commit()

    # Create a new class in the school
    response = client.post(f'/schools/{school.id}/classes', json={
        'name': 'New Class',
        'educator_id': 1
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 201
    assert response.json['msg'] == 'Class created'

    # Verify the class was created
    new_class = Class.query.first()
    assert new_class.name == 'New Class'
    assert new_class.school_id == school.id