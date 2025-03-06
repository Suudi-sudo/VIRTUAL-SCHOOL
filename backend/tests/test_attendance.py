import json
import pytest
from app import app, db
from models import Attendance

@pytest.fixture
def client():
    """Fixture to create a test client and initialize the database."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_get_attendance_empty(client):
    """Test fetching attendance when no records exist."""
    response = client.get('/attendance')
    assert response.status_code == 200
    data = response.get_json()
    assert data["attendance"] == []

def test_mark_attendance(client):
    """Test marking attendance successfully."""
    attendance_data = {
        "class_id": 1,
        "student_id": 101,
        "status": "Present",
        "signed_by": "Educator A"
    }
    response = client.post('/attendance', json=attendance_data)
    assert response.status_code == 201
    data = response.get_json()
    assert "id" in data

def test_mark_attendance_missing_fields(client):
    """Test marking attendance with missing fields."""
    response = client.post('/attendance', json={"class_id": 1})
    assert response.status_code == 400
    data = response.get_json()
    assert data["msg"] == "class_id, student_id, status, and signed_by required"

def test_update_attendance(client):
    """Test updating attendance status."""
    attendance = Attendance(class_id=1, student_id=101, status="Absent", signed_by="Educator A")
    db.session.add(attendance)
    db.session.commit()

    response = client.put(f'/attendance/{attendance.id}', json={"status": "Present"})
    assert response.status_code == 200
    
    # Use db.session.get() instead of Query.get()
    updated_attendance = db.session.get(Attendance, attendance.id)
    assert updated_attendance.status == "Present"

def test_update_attendance_not_found(client):
    """Test updating non-existent attendance record."""
    response = client.put('/attendance/9999', json={"status": "Present"})
    assert response.status_code == 404

def test_delete_attendance(client):
    """Test deleting attendance record."""
    attendance = Attendance(class_id=1, student_id=101, status="Present", signed_by="Educator A")
    db.session.add(attendance)
    db.session.commit()

    response = client.delete(f'/attendance/{attendance.id}')
    assert response.status_code == 200
    
    # Use db.session.get() instead of Query.get()
    assert db.session.get(Attendance, attendance.id) is None

def test_delete_attendance_not_found(client):
    """Test deleting non-existent attendance record."""
    response = client.delete('/attendance/9999')
    assert response.status_code == 404