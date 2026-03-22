import { NavLink, useNavigate } from "react-router-dom";
import {
    LucideBuilding2,
    LucideUsers,
    LucideCoins,
    LucideFileText,
    LucideClipboardList,
    LucideBarChart3,
    LucideSettings,
    LucideShield,
    LucideKey,
    LucideLayoutDashboard,
    LucideChevronLeft,
    LucideChevronRight,
    LucideLogOut,
    LucideUser,
    LucideMenu,
    LucideX,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AdminSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/auth/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: LucideLayoutDashboard },
        { label: "Company Profile", href: "/admin/company", icon: LucideBuilding2 },
        { label: "Team Members", href: "/admin/team", icon: LucideUsers },
        { label: "Credits & Billing", href: "/admin/credits", icon: LucideCoins },
        { label: "Travel Plans", href: "/admin/plans", icon: LucideFileText },
        { label: "Travel Requests", href: "/admin/requests", icon: LucideClipboardList },
        { label: "Reports", href: "/admin/reports", icon: LucideBarChart3 },
        { label: "Audit Log", href: "/admin/audit", icon: LucideShield },
        { label: "API Keys", href: "/admin/api-keys", icon: LucideKey },
        { label: "Settings", href: "/admin/settings", icon: LucideSettings },
    ];

    const sidebarContent = (
        <>
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">TM</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold leading-tight">TMAG</p>
                            <p className="text-white/40 text-[10px] leading-tight">Admin Portal</p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mx-auto">
                        <span className="text-white font-bold text-sm">TM</span>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === "/admin"}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                                isActive
                                    ? "bg-accent text-white"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            } ${collapsed ? "justify-center" : ""}`
                        }
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 py-4 border-t border-white/10">
                {!collapsed ? (
                    <div className="px-3 py-2.5 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
                                <LucideUser className="w-4 h-4 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{user?.name || "Admin"}</p>
                                <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="mt-2 w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs"
                        >
                            <LucideLogOut className="w-3.5 h-3.5" />
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <LucideLogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-darkest text-white shadow-lg"
            >
                <LucideMenu className="w-5 h-5" />
            </button>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="fixed top-0 left-0 h-full w-64 bg-darkest text-white flex flex-col z-50">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
                        >
                            <LucideX className="w-5 h-5" />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            <aside
                className={`hidden lg:flex flex-col bg-darkest text-white transition-all duration-300 fixed top-0 left-0 h-screen z-40 ${
                    collapsed ? "w-20" : "w-64"
                }`}
            >
                {sidebarContent}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`absolute top-5 text-white/30 hover:text-white transition-colors ${
                        collapsed ? "right-3" : "right-4"
                    }`}
                >
                    {collapsed ? (
                        <LucideChevronRight className="w-4 h-4" />
                    ) : (
                        <LucideChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </aside>
        </>
    );
};

export default AdminSidebar;
