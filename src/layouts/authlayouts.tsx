import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthLayout = () => {
    const { isAuthenticated, isLoading, passwordExpired } = useAuth();
    const location = useLocation();
    const onChangePassword = location.pathname === "/auth/change-password";

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-darkest flex items-center justify-center">
                        <span className="text-white font-bold">TM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated but the password expired: force the change-password page only.
    if (isAuthenticated && passwordExpired && !onChangePassword) {
        return <Navigate to="/auth/change-password" replace />;
    }

    // Already logged in (and password OK) — go to admin dashboard.
    if (isAuthenticated && !passwordExpired) {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            <div className="flex-1 flex items-center justify-center px-6 pb-16">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
