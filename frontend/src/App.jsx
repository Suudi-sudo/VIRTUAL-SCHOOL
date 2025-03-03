import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// import StudentDashboard from "./pages/StudentDashboard/Dashboard";

import Dashboard from './pages/OwnersDashboard/Dashboard';
import Students from './pages/OwnersDashboard/Students';
import Teachers from './pages/OwnersDashboard/Teachers';
import Settings from './pages/OwnersDashboard/Settings';
import CreateSchool from './pages/OwnersDashboard/CreateSchool';
// import Sidebar from "./pages/OwnersDashboard/Sidebar";
import School from "./pages/OwnersDashboard/School";
import SchoolDetail from "./pages/OwnersDashboard/Studentdetail";
import ClassPage from "./pages/OwnersDashboard/Class";

import "./App.css"; // Import the CSS file

import ExamPage from "./pages/StudentDashboard/Exam";
// educator 
import EducatorDashboard from "./pages/Educator/EducatorDashboard";
import Attendance from "./pages/Educator/Attendance";
import Resources from "./pages/Educator/Resources";
import Permissions from "./pages/Educator/Permissions";
import ClassChat from "./pages/Educator/ClassChat";
import ExamManagementPage from "./pages/Educator/Exams";

import StudentsDashboard from './pages/StudentDashboard/Dashboard';
import Chat from './pages/StudentDashboard/Chat';
import Exam from './pages/StudentDashboard/Exam';
import GradeSummary from './pages/StudentDashboard/GradeSummary';
import Profile from './pages/StudentDashboard/Profile';
import StudyMaterial from './pages/StudentDashboard/StudyMaterial';

function App() {
    return (
        <Router className= 'app'>
            {/* <Navbar /> */}
            {/* <Sidebar /> */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/admin" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/createschool" element={<CreateSchool />} />
                <Route path="/schools" element={<School />} />
                <Route path="/schools/:schoolId" element={<SchoolDetail />} />
                <Route path="/classes" element={<ClassPage />} />

                {/* <Route path="/student" element={<StudentDashboard />} />
                <Route path="/exam" element={<ExamPage/>} /> */}
                 {/* educator route */}
                <Route path="/educator/dashboard" element={<EducatorDashboard />} />
                <Route path="/educator/attendance" element={<Attendance />} />
                <Route path="/educator/resources" element={<Resources />} />
                <Route path="/educator/permissions" element={<Permissions />} />
                <Route path="/educator/chat" element={<ClassChat />} />
                <Route path="/educator/exams" element={<ExamManagementPage />} />

                <Route path="/student/dashboard" element={<StudentsDashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/exam" element={<Exam />} />
                <Route path="/grade-summary" element={<GradeSummary />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/study-material" element={<StudyMaterial />} />
                
                </Routes>
        </Router>
    );
}

export default App;