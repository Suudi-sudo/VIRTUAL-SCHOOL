import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";


// Lazy load pages
const EducatorDashboard = lazy(() => import("./EducatorDashboard"));
const Attendance = lazy(() => import("./Attendance"));
const Resources = lazy(() => import("./Resources"));
const Permissions = lazy(() => import("./Permissions"));
const ClassChat = lazy(() => import("./ClassChat"));
const Exams = lazy(() => import("./Exams"));

const EducatorRoutes = () => {
  const { user } = useAuth(); // Get logged-in user

  // Redirect non-educators to home
  if (!user || user.role !== "educator") {
    return <Navigate to="/" />;
  }

  return (
    
      <Routes>
        <Route path="/educator/dashboard" element={<EducatorDashboard />} />
        <Route path="/educator/attendance" element={<Attendance />} />
        <Route path="/educator/resources" element={<Resources />} />
        <Route path="/educator/permissions" element={<Permissions />} />
        <Route path="/educator/chat" element={<ClassChat />} />
        <Route path="/educator/exams" element={<Exams />} />
        
      </Routes>
   
  );
};

export default EducatorRoutes;
