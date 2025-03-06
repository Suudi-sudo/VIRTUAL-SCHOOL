import pytest
from flask import Flask, jsonify
from flask.testing import FlaskClient
from flask_jwt_extended import create_access_token, JWTManager
from models import Chat, User, db
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
        user = User(username='testuser', email='test@example.com', role='Student', school_id=1)
        user.set_password('password')
        db.session.add(user)
        db.session.commit()

        # Generate a JWT token for the test user
        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
        return access_token

def test_get_chats(client, jwt_token):
    # Add a test chat
    chat = Chat(
        class_id=1,
        school_id=1,
        sender_id=1,
        message='Test message',
        timestamp='2023-10-01T10:00:00'
    )
    db.session.add(chat)
    db.session.commit()

    # Fetch chats
    response = client.get('/chats/1', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert len(response.json['chats']) == 1
    assert response.json['chats'][0]['message'] == 'Test message'

def test_create_chat(client, jwt_token):
    # Create a new chat
    response = client.post('/chats', json={
        'class_id': 1,
        'message': 'New message'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 201
    assert response.json['msg'] == 'Chat message sent'

    # Verify the chat was created
    chat = Chat.query.first()
    assert chat.message == 'New message'

def test_get_chat(client, jwt_token):
    # Add a test chat
    chat = Chat(
        class_id=1,
        school_id=1,
        sender_id=1,
        message='Test message',
        timestamp='2023-10-01T10:00:00'
    )
    db.session.add(chat)
    db.session.commit()

    # Fetch the chat
    response = client.get(f'/chats/message/{chat.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['message'] == 'Test message'

def test_update_chat(client, jwt_token):
    # Add a test chat
    chat = Chat(
        class_id=1,
        school_id=1,
        sender_id=1,
        message='Test message',
        timestamp='2023-10-01T10:00:00'
    )
    db.session.add(chat)
    db.session.commit()

    # Update the chat
    response = client.put(f'/chats/message/{chat.id}', json={
        'message': 'Updated message'
    }, headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Chat updated'

    # Verify the chat was updated
    updated_chat = Chat.query.get(chat.id)
    assert updated_chat.message == 'Updated message'

def test_delete_chat(client, jwt_token):
    # Add a test chat
    chat = Chat(
        class_id=1,
        school_id=1,
        sender_id=1,
        message='Test message',
        timestamp='2023-10-01T10:00:00'
    )
    db.session.add(chat)
    db.session.commit()

    # Delete the chat
    response = client.delete(f'/chats/message/{chat.id}', headers={
        'Authorization': f'Bearer {jwt_token}'
    })
    assert response.status_code == 200
    assert response.json['msg'] == 'Chat deleted'

    # Verify the chat was deleted
    deleted_chat = Chat.query.get(chat.id)
    assert deleted_chat is None