import pytest
from flask import Flask, jsonify
from flask.testing import FlaskClient
from flask_jwt_extended import create_access_token, JWTManager
from models import User, db
from app import create_app  # Assuming you have a create_app function in your app.py

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    app.config['MAIL_SUPPRESS_SEND'] = True  # Suppress email sending during tests

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
        user = User(username='testuser', email='test@example.com', role='Student')
        user.set_password('password')
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
        return access_token

def test_register(client):
    response = client.post('/register', json={
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'password',
        'role': 'Student'
    })
    assert response.status_code == 201
    assert response.json['msg'] == 'User created successfully.'

def test_login(client):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, try to login
    response = client.post('/login', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_google_login(client):
    response = client.post('/google_login', json={
        'email': 'googleuser@example.com'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_reset_password_request(client):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, request a password reset
    response = client.post('/reset-password', json={
        'email': 'test@example.com'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Reset link sent to your email.'

def test_reset_password_with_token(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, request a password reset
    response = client.post('/reset-password', json={
        'email': 'test@example.com'
    })
    assert response.status_code == 200

    # Simulate the token generation (in a real scenario, this would be sent via email)
    token = jwt_token

    # Now, reset the password using the token
    response = client.post(f'/reset-password/{token}', json={
        'new_password': 'newpassword'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Password has been reset successfully.'

def test_profile_get(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, get the profile
    response = client.get('/profile/1', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['username'] == 'testuser'

def test_profile_update(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, update the profile
    response = client.put('/profile/1', json={
        'username': 'updateduser'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Profile updated successfully.'

def test_upload_profile_pic(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, upload a profile picture
    with open('tests/test_image.jpg', 'rb') as img:
        response = client.post('/upload-profile-pic', data={
            'file': img
        }, headers={
            'Authorization': f'Bearer {jwt_token}'
        })
    assert response.status_code == 200
    assert 'url' in response.json

def test_get_users(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, get the list of users
    response = client.get('/users', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert len(response.json['users']) > 0

def test_logout(client, jwt_token):
    # Logout is client-side, so we just test the endpoint
    response = client.post('/logout', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Logout successful. Please remove your token from storage.'

def test_update_user(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, update the user
    response = client.put('/users/1/update', json={
        'username': 'updateduser'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'User updated successfully.'

def test_delete_user(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, delete the user
    response = client.delete('/users/1/delete', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'User deleted successfully.'

def test_add_student_to_school(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, add the student to a school
    response = client.patch('/schools/1/add-student', json={
        'student_id': 1
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Student assigned to school successfully.'

def test_add_educator_to_school(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Educator'
    })

    # Then, add the educator to a school
    response = client.patch('/schools/1/add-educator', json={
        'teacher_id': 1
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Educator assigned to school successfully.'

def test_add_student_to_class(client, jwt_token):
    # First, register a user
    client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password',
        'role': 'Student'
    })

    # Then, add the student to a class
    response = client.post('/classes/1/add-student', json={
        'student_id': 1
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 201
    assert response.json['msg'] == 'Student added to class successfully.'