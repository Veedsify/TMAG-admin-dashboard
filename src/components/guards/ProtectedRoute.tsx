import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";

const ALLOWED_ROLES = ["super_admin", "client_admin"];

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

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

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (user && !ALLOWED_ROLES.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-primary px-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-serif font-semibold text-heading mb-2">Access Denied</h1>
                    <p className="text-sm text-body mb-6">
                        You do not have permission to access the admin dashboard. Only SuperAdmin and Administrator roles are allowed.
                    </p>
                    <button
                        onClick={() => {
                            window.location.href = "/auth/login";
                        }}
                        className="px-6 py-2.5 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
