import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, userRole, allowedRole }) => {
    console.log("PrivateRoute Debug:", { isAuthenticated, userRole, allowedRole }); // 🛠️ Debugging

    if (!isAuthenticated) {
        return <Navigate to="/login" />; // Redirect to login if not authenticated
    }

    // Convert roles to lowercase to avoid case issues
    const normalizedUserRole = userRole?.toLowerCase();
    const normalizedAllowedRole = allowedRole?.toLowerCase();

    if (normalizedUserRole !== normalizedAllowedRole) {
        return <Navigate to="/" />; // Redirect to home if the role doesn't match
    }

    return <Outlet />; // Render the educator dashboard if authorized
};

export default PrivateRoute;
