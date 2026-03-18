import { LucideBell, LucideLogOut, LucideUser } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear auth and redirect
        localStorage.clear();
        navigate("/auth/login");
    };

    return (
        <header className="h-16 bg-white border-b border-border-light/50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-heading">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-background-primary transition-colors">
                    <LucideBell className="w-5 h-5 text-muted" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-background-primary transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <LucideUser className="w-4 h-4 text-accent" />
                        </div>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-border-light/50 shadow-lg py-2 z-50">
                            <button
                                onClick={() => navigate("/admin/settings")}
                                className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors"
                            >
                                Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <LucideLogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
