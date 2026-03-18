import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";

const AdminSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

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

    return (
        <aside
            className={`bg-white border-r border-border-light/50 flex flex-col transition-all duration-300 ${
                collapsed ? "w-20" : "w-64"
            }`}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-light/50">
                {!collapsed && (
                    <span className="text-heading tracking-tight text-xl font-serif font-medium">
                        TMAG Admin
                    </span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-background-primary transition-colors"
                >
                    {collapsed ? (
                        <LucideChevronRight className="w-5 h-5 text-muted" />
                    ) : (
                        <LucideChevronLeft className="w-5 h-5 text-muted" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === "/admin"}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-accent text-white"
                                    : "text-muted hover:bg-background-primary hover:text-heading"
                            } ${collapsed ? "justify-center" : ""}`
                        }
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border-light/50">
                {!collapsed && (
                    <div className="text-xs text-muted text-center">
                        <p className="font-semibold">Admin Dashboard</p>
                        <p className="mt-1">v1.0.0</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default AdminSidebar;
