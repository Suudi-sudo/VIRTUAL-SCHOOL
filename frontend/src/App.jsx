import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css"; // Import the CSS file
import EducatorDashboard from "./pages/Educator/EducatorDashboard";


function App() {
    return (
        <Router className= 'app'>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/educator" element={<EducatorDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;