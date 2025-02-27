import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard/Dashboard";


import Dashboard from './pages/OwnersDashboard/Dashboard';
import Students from './pages/OwnersDashboard/Students';
import Teachers from './pages/OwnersDashboard/Teachers';
import Settings from './pages/OwnersDashboard/Settings';
import CreateSchool from './pages/OwnersDashboard/CreateSchool';
// import Sidebar from "./pages/OwnersDashboard/Sidebar";
import School from "./pages/OwnersDashboard/School";


import "./App.css"; // Import the CSS file
import EducatorDashboard from "./pages/Educator/EducatorDashboard";
import ExamPage from "./pages/StudentDashboard/Exam";


function App() {
    return (
        <Router className= 'app'>
            <Navbar />
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

                <Route path="/educator" element={<EducatorDashboard />} />

                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/exam" element={<ExamPage/>} />


            </Routes>
        </Router>
    );
}

export default App;