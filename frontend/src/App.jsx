import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import StudentDashboard from "./pages/StudentDashboard/Dashboard";
import "./App.css"; // Import the CSS file


function App() {
    return (
        <Router className= 'app'>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
               
            </Routes>
        </Router>
    );
}

export default App;