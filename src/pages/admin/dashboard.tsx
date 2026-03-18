import { LucideUsers, LucideCoins, LucideFileText, LucideClipboardCheck, LucideArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const stats = [
        { label: "Total Team Members", value: "24", icon: LucideUsers, href: "/admin/team" },
        { label: "Credits Remaining", value: "142", icon: LucideCoins, href: "/admin/credits" },
        { label: "Active Travel Plans", value: "8", icon: LucideFileText, href: "/admin/plans" },
        { label: "Pending Requests", value: "3", icon: LucideClipboardCheck, href: "/admin/requests" },
    ];

    const recentActivity = [
        { action: "New travel plan created", user: "Sarah Chen", time: "2 hours ago" },
        { action: "Travel request approved", user: "John Doe", time: "5 hours ago" },
        { action: "Credits purchased", user: "Admin", time: "1 day ago" },
        { action: "New team member invited", user: "Admin", time: "2 days ago" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">Dashboard</h1>
                <p className="text-sm text-muted">Overview of your company's travel health management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        to={stat.href}
                        className="bg-white rounded-2xl border border-border-light/50 p-6 hover:border-accent/30 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <stat.icon className="w-5 h-5 text-accent" />
                            </div>
                            <LucideArrowRight className="w-4 h-4 text-muted" />
                        </div>
                        <p className="text-3xl font-serif text-heading mb-1">{stat.value}</p>
                        <p className="text-xs text-muted">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link
                        to="/admin/team/invite"
                        className="p-4 rounded-xl border border-border-light hover:border-accent/50 transition-colors"
                    >
                        <p className="text-sm font-semibold text-heading">Invite Team Members</p>
                        <p className="text-xs text-muted mt-1">Add new employees to your company</p>
                    </Link>
                    <Link
                        to="/admin/plans/create"
                        className="p-4 rounded-xl border border-border-light hover:border-accent/50 transition-colors"
                    >
                        <p className="text-sm font-semibold text-heading">Create Travel Plan</p>
                        <p className="text-xs text-muted mt-1">Generate a new health plan</p>
                    </Link>
                    <Link
                        to="/admin/credits"
                        className="p-4 rounded-xl border border-border-light hover:border-accent/50 transition-colors"
                    >
                        <p className="text-sm font-semibold text-heading">Purchase Credits</p>
                        <p className="text-xs text-muted mt-1">Add credits to your balance</p>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-lg font-semibold text-heading">Recent Activity</h2>
                </div>
                <div className="divide-y divide-border-light/50">
                    {recentActivity.map((activity, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-heading">{activity.action}</p>
                                <p className="text-xs text-muted mt-0.5">{activity.user}</p>
                            </div>
                            <span className="text-xs text-muted">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
