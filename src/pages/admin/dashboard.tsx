import { LucideUsers, LucideCoins, LucideFileText, LucideClipboardCheck, LucideArrowRight, LucideLoader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyCompanies, useEmployees, useTravelPlans, useTravelRequests } from "../../api/hooks";

const Dashboard = () => {
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: employeesData, isLoading: employeesLoading } = useEmployees(
        companyId ? { companyId, per_page: 100 } : undefined
    );
    const { data: plansData, isLoading: plansLoading } = useTravelPlans(
        companyId ? { companyId, per_page: 100 } : undefined
    );
    const { data: requestsData, isLoading: requestsLoading } = useTravelRequests(
        companyId ? { companyId } : undefined
    );

    const totalEmployees = employeesData?.pagination.total ?? 0;
    const totalCredits = company?.total_credits ?? 0;
    const usedCredits = company?.used_credits ?? 0;
    const remainingCredits = totalCredits - usedCredits;
    const activePlans = plansData?.data.filter(p => p.status === "COMPLETED" || p.status === "PROCESSING").length ?? 0;
    const pendingRequests = requestsData?.data.filter(r => r.status === "PENDING").length ?? 0;

    const stats = [
        { label: "Total Team Members", value: totalEmployees, icon: LucideUsers, href: "/admin/team", loading: employeesLoading },
        { label: "Credits Remaining", value: remainingCredits, icon: LucideCoins, href: "/admin/credits", loading: false },
        { label: "Active Travel Plans", value: activePlans, icon: LucideFileText, href: "/admin/plans", loading: plansLoading },
        { label: "Pending Requests", value: pendingRequests, icon: LucideClipboardCheck, href: "/admin/requests", loading: requestsLoading },
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
                                {stat.loading ? (
                                    <LucideLoader2 className="w-5 h-5 text-accent animate-spin" />
                                ) : (
                                    <stat.icon className="w-5 h-5 text-accent" />
                                )}
                            </div>
                            <LucideArrowRight className="w-4 h-4 text-muted" />
                        </div>
                        <p className="text-3xl font-serif text-heading mb-1">
                            {stat.loading ? "-" : stat.value}
                        </p>
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
