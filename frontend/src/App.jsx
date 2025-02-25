import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/OwnersDashboard/Dashboard';
import Students from './pages/OwnersDashboard/Students';
import Teachers from './pages/OwnersDashboard/Teachers';
import Settings from './pages/OwnersDashboard/Settings';
import CreateSchool from './pages/OwnersDashboard/CreateSchool';
// import Sidebar from "./pages/OwnersDashboard/Sidebar";
import School from "./pages/OwnersDashboard/School";
import "./App.css"; // Import the CSS file


function App() {
    return (
        <Router className= 'app'>
            <Navbar />
            {/* <Sidebar /> */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
               {/* <Sidebar /> */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/createschool" element={<CreateSchool />} />
        <Route path="/schools" element={<School />} />
               
            </Routes>
        </Router>
    );
}

export default App;