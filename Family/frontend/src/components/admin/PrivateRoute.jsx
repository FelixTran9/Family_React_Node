import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
