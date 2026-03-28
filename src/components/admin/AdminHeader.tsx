import { LucideBell, LucideLogOut, LucideUser } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/company": "Company Profile",
    "/admin/team": "Team Members",
    "/admin/team/invite": "Invite Team Members",
    "/admin/team/onboarding": "Onboarding Status",
    "/admin/credits": "Credits & Billing",
    "/admin/credits/invoices": "Invoices",
    "/admin/plans": "Travel Plans",
    "/admin/plans/create": "Create Travel Plan",
    "/admin/requests": "Credit Requests",
    "/admin/reports": "Reports & Analytics",
    "/admin/audit": "Audit Log",
    "/admin/api-keys": "API Keys",
    "/admin/settings": "Settings",
    "/admin/settings/export": "Data Export",
};

const roleBadge: Record<string, { label: string; className: string }> = {
    super_admin: { label: "Super Admin", className: "bg-accent/10 text-accent border-accent/20" },
    client_admin: { label: "Administrator", className: "bg-blue-50 text-blue-600 border-blue-200" },
    support_admin: { label: "Support", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const AdminHeader = () => {
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const title = pageTitles[location.pathname] ?? "Dashboard";
    const badge = roleBadge[user?.role ?? "support_admin"];

    const notifications = [
        { id: 1, text: "New travel request from Anna Chen", time: "2h ago", unread: true },
        { id: 2, text: "Travel plan completed for Tokyo trip", time: "5h ago", unread: true },
        { id: 3, text: "New team member invited", time: "1d ago", unread: false },
    ];
    const unreadCount = notifications.filter((n) => n.unread).length;

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".profile-menu") && !target.closest(".notification-menu")) {
                setShowProfile(false);
                setShowNotifications(false);
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/auth/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    return (
        <header className="h-16 bg-white border-b border-border-light/50 flex items-center justify-between px-4 sm:px-6 lg:px-12 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <div className="lg:hidden w-8" />
                <div>
                    <h1 className="text-lg sm:text-xl font-serif font-semibold text-heading leading-tight">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <div className={`hidden sm:flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold ${badge.className}`}>
                    {badge.label}
                </div>

                <div className="relative notification-menu">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications(!showNotifications);
                            setShowProfile(false);
                        }}
                        className="relative p-2 rounded-xl hover:bg-background-primary transition-colors"
                    >
                        <LucideBell className="w-5 h-5 text-muted" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-border-light/50 shadow-xl py-2 z-50">
                            <div className="px-4 py-2 border-b border-border-light/50">
                                <p className="text-sm font-semibold text-heading">Notifications</p>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`px-4 py-3 hover:bg-background-primary/50 transition-colors border-b border-border-light/30 last:border-0 ${
                                            n.unread ? "bg-accent/5" : ""
                                        }`}
                                    >
                                        <p className="text-sm text-heading leading-snug">{n.text}</p>
                                        <p className="text-xs text-muted mt-0.5">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2 border-t border-border-light/50">
                                <button className="text-xs text-accent font-medium hover:underline">View all notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative profile-menu">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowProfile(!showProfile);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-background-primary transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <LucideUser className="w-4 h-4 text-accent" />
                        </div>
                        <span className="hidden md:block text-sm font-medium text-heading">
                            {user?.name || "Admin"}
                        </span>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border-light/50 shadow-xl py-2 z-50">
                            <div className="px-4 py-2 border-b border-border-light/50">
                                <p className="text-sm font-semibold text-heading">{user?.name || "Admin"}</p>
                                <p className="text-xs text-muted truncate">{user?.email}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge.className}`}>
                                    {badge.label}
                                </span>
                            </div>
                            <div className="border-t border-border-light/50 mt-1 pt-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <LucideLogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
