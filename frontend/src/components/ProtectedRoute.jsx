import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// requireAdmin = true → chỉ ROLE_ADMIN mới vào được
export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { token, isAdmin } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
