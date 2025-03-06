# VIRTUAL SCHOOL

## 📚 Overview
VIRTUAL SCHOOL is a full-stack web application designed to facilitate online learning by providing a platform for schools, educators, and students. The system includes features such as school creation, student and educator management, attendance tracking, resource storage, online exams with plagiarism prevention, and class-based chats. Future improvements will include video conferencing and co-curricular activities.

## 🛠️ Tech Stack
### Frontend:
- **React.js** (with Context API / Redux Toolkit for state management)
- **Tailwind CSS** (for UI styling)
- **React Router** (for navigation)
- **Axios** (for API requests)

### Backend:
- **Flask** (REST API framework)
- **PostgreSQL** (Database)
- **SQLAlchemy** (ORM for database interaction)
- **Flask-JWT-Extended** (Authentication & Authorization)
- **Pytest** (for testing)

### Other Tools:
- **Figma** (for wireframing & UI design)
- **Docker** (for containerization)
- **GitHub Actions** (for CI/CD)

## 🚀 Features
- **User Roles:** Admin, Educators, and Students
- **Student & Educator Management**
- **Course & Resource Management**
- **Attendance Tracking**
- **Online Exams (with plagiarism detection)**
- **Class-based Chat System**
- **School Creation & Administration**
- **Secure Authentication & Authorization**

## 🔧 Installation & Setup
### Prerequisites
- Node.js & npm
- Python (>=3.8)
- PostgreSQL
- Virtual Environment (optional but recommended)

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/Suudi-sudo/VIRTUAL-SCHOOL.git
cd VIRTUAL-SCHOOL/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (Create .env file)
export FLASK_APP=app.py
export FLASK_ENV=development

# Run migrations
flask db upgrade

# Start the server
flask run
```

### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start the frontend server
npm start
```

## 📌 API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/schools` | GET | Retrieve all schools |
| `/api/schools` | POST | Create a new school |
| `/api/students` | GET | Retrieve all students |
| `/api/educators` | GET | Retrieve all educators |
| `/api/attendance` | POST | Mark attendance |
| `/api/exams` | POST | Create an online exam |

## ✅ Testing
Run tests for the backend using:
```bash
pytest
```

## 📌 Future Enhancements
- Video conferencing for online classes
- AI-based plagiarism detection
- Co-curricular activity tracking

## 📝 License
This project is licensed under the **MIT License**.

## 🤝 Contributors
- **Suudi Sudo** ([@Suudi-sudo](https://github.com/Suudi-sudo))

---
Feel free to contribute, raise issues, or suggest improvements! 🚀
