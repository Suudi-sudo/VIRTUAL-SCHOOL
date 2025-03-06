import pytest
from flask import Flask, jsonify
from flask.testing import FlaskClient
from flask_jwt_extended import create_access_token, JWTManager
from models import User, Exam, Class, db
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
        user = User(username='testuser', email='test@example.com', role='Educator', school_id=1)
        user.set_password('password')
        db.session.add(user)
        db.session.commit()

        # Create a test class
        test_class = Class(name='Test Class', school_id=1)
        db.session.add(test_class)
        db.session.commit()

        # Generate a JWT token for the test user
        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
        return access_token

def test_get_exams(client, jwt_token):
    # Add a test exam
    exam = Exam(
        class_id=1,
        exam_title='Test Exam',
        start_time='2023-10-01T10:00:00',
        duration_minutes=60,
        status='scheduled',
        school_id=1
    )
    db.session.add(exam)
    db.session.commit()

    # Fetch exams
    response = client.get('/exams', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert len(response.json['exams']) == 1
    assert response.json['exams'][0]['exam_title'] == 'Test Exam'

def test_create_exam(client, jwt_token):
    # Create a new exam
    response = client.post('/exams', json={
        'class_id': 1,
        'exam_title': 'New Exam',
        'start_time': '2023-10-01T10:00:00',
        'duration_minutes': 90,
        'status': 'scheduled'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 201
    assert response.json['msg'] == 'Exam created'

    # Verify the exam was created
    exam = Exam.query.first()
    assert exam.exam_title == 'New Exam'

def test_get_exam(client, jwt_token):
    # Add a test exam
    exam = Exam(
        class_id=1,
        exam_title='Test Exam',
        start_time='2023-10-01T10:00:00',
        duration_minutes=60,
        status='scheduled',
        school_id=1
    )
    db.session.add(exam)
    db.session.commit()

    # Fetch the exam
    response = client.get(f'/exams/{exam.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['exam_title'] == 'Test Exam'

def test_update_exam(client, jwt_token):
    # Add a test exam
    exam = Exam(
        class_id=1,
        exam_title='Test Exam',
        start_time='2023-10-01T10:00:00',
        duration_minutes=60,
        status='scheduled',
        school_id=1
    )
    db.session.add(exam)
    db.session.commit()

    # Update the exam
    response = client.put(f'/exams/{exam.id}', json={
        'exam_title': 'Updated Exam',
        'start_time': '2023-10-01T11:00:00',
        'duration_minutes': 90,
        'status': 'in_progress'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Exam updated'

    # Verify the exam was updated
    updated_exam = Exam.query.get(exam.id)
    assert updated_exam.exam_title == 'Updated Exam'
    assert updated_exam.duration_minutes == 90

def test_delete_exam(client, jwt_token):
    # Add a test exam
    exam = Exam(
        class_id=1,
        exam_title='Test Exam',
        start_time='2023-10-01T10:00:00',
        duration_minutes=60,
        status='scheduled',
        school_id=1
    )
    db.session.add(exam)
    db.session.commit()

    # Delete the exam
    response = client.delete(f'/exams/{exam.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Exam deleted'

    # Verify the exam was deleted
    deleted_exam = Exam.query.get(exam.id)
    assert deleted_exam is None