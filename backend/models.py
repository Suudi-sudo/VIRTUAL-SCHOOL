from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    """Stores all users (School Owners, Educators, Students)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False)  # owner, educator, student
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)  # ✅ Add this
    # ✅ Fix: Explicit foreign_keys
    school = relationship("School", back_populates="users", foreign_keys=[school_id])

    students_classes = relationship("StudentsClasses", back_populates="student")
    classes_as_educator = relationship("Class", back_populates="educator")
    resources_uploaded = relationship("Resource", back_populates="uploader")
    
    # ✅ Fix: Explicit foreign_keys for Attendance (no confusion)
    attendances_marked = relationship("Attendance", back_populates="educator", foreign_keys="[Attendance.signed_by]")

    exam_submissions = relationship("ExamSubmission", back_populates="student")
    chats_sent = relationship("Chat", back_populates="sender")

    def __repr__(self):
        return f"<User {self.name} ({self.role})>"

class School(db.Model):
    """Each school is independent."""
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # ✅ Fix: Explicit foreign_keys for creator (avoid ambiguity)
    creator = relationship("User", foreign_keys=[created_by], backref="created_schools")

    users = relationship("User", back_populates="school", foreign_keys="[User.school_id]")
    classes = relationship("Class", back_populates="school")

    def __repr__(self):
        return f"<School {self.name}>"

class Class(db.Model):
    """Each school has multiple classes."""
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    name = Column(String(100), nullable=False)
    educator_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    school = relationship("School", back_populates="classes")
    educator = relationship("User", back_populates="classes_as_educator", foreign_keys=[educator_id])
    
    students = relationship("StudentsClasses", back_populates="class_")
    attendances = relationship("Attendance", back_populates="class_")
    resources = relationship("Resource", back_populates="class_")
    exams = relationship("Exam", back_populates="class_")
    chats = relationship("Chat", back_populates="class_")

    def __repr__(self):
        return f"<Class {self.name}>"

class StudentsClasses(db.Model):
    """Tracks which student is in which class."""
    __tablename__ = "students_classes"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    student = relationship("User", back_populates="students_classes", foreign_keys=[student_id])
    class_ = relationship("Class", back_populates="students")

    def __repr__(self):
        return f"<Student {self.student_id} - Class {self.class_id}>"

class Attendance(db.Model):
    """Logs student presence."""
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(10), nullable=False)  # present, absent
    signed_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    class_ = relationship("Class", back_populates="attendances")
    
    # ✅ Fix: Explicit foreign_keys (avoid conflict)
    student = relationship("User", foreign_keys=[student_id])
    educator = relationship("User", foreign_keys=[signed_by], back_populates="attendances_marked")

    def __repr__(self):
        return f"<Attendance {self.student_id} - {self.status}>"

class Resource(db.Model):
    """Stores uploaded files/notes."""
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    class_ = relationship("Class", back_populates="resources")
    uploader = relationship("User", back_populates="resources_uploaded", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<Resource {self.file_url}>"

class Exam(db.Model):
    """Stores exam details."""
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    exam_title = Column(String(150), nullable=False)
    start_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)  # upcoming, active, completed

    class_ = relationship("Class", back_populates="exams")
    submissions = relationship("ExamSubmission", back_populates="exam")

    def __repr__(self):
        return f"<Exam {self.exam_title} - {self.status}>"

class ExamSubmission(db.Model):
    """Tracks student answers."""
    __tablename__ = "exam_submissions"

    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answers_json = Column(Text, nullable=False)  # Store answers in JSON format
    score = Column(Integer, nullable=True)

    exam = relationship("Exam", back_populates="submissions")
    student = relationship("User", back_populates="exam_submissions", foreign_keys=[student_id])

    def __repr__(self):
        return f"<ExamSubmission Exam {self.exam_id} - Student {self.student_id}>"

class Chat(db.Model):
    """Stores class-based messages."""
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    class_ = relationship("Class", back_populates="chats")
    sender = relationship("User", back_populates="chats_sent", foreign_keys=[sender_id])

    def __repr__(self):
        return f"<Chat {self.sender_id} - {self.class_id}>"
