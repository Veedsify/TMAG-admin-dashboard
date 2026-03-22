import { useState } from "react";
import { LucideSearch, LucideFilter, LucideShield, LucideUserCog, LucideCoins, LucideFilePlus, LucideUserPlus, LucideLoader2 } from "lucide-react";
import { useMyCompanies, useEmployees, useTravelPlans, useTravelRequests } from "../../../api/hooks";

interface LogEntry {
    id: string;
    action: string;
    actor: string;
    target: string;
    time: string;
    sortDate: number;
    type: string;
}

const AuditLog = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string>("all");
    const { data: myCompanies } = useMyCompanies();
    const companyId = myCompanies?.[0]?.id;

    const { data: employeesData, isLoading: empLoading } = useEmployees(companyId ? { companyId, per_page: 100 } : undefined);
    const { data: plansData, isLoading: plansLoading } = useTravelPlans(companyId ? { companyId, per_page: 100 } : undefined);
    const { data: requestsData, isLoading: reqLoading } = useTravelRequests(companyId ? { companyId, per_page: 100 } : undefined);

    const isLoading = empLoading || plansLoading || reqLoading;

    // Build log entries from real data
    const logs: LogEntry[] = [];

    (employeesData?.data ?? []).forEach((emp) => {
        logs.push({
            id: `emp-${emp.id}`,
            action: emp.status === "active" ? "Team member onboarded" : "Team member invited",
            actor: "Admin",
            target: `${emp.name} — ${emp.department}`,
            time: new Date(emp.createdAt).toLocaleDateString(),
            sortDate: new Date(emp.createdAt).getTime(),
            type: "team",
        });
    });

    (plansData?.data ?? []).forEach((plan) => {
        logs.push({
            id: `plan-${plan.id}`,
            action: `Travel plan ${plan.status?.toLowerCase() === "completed" ? "completed" : "created"}`,
            actor: "System",
            target: `${plan.destination}, ${plan.country}`,
            time: new Date(plan.createdAt).toLocaleDateString(),
            sortDate: new Date(plan.createdAt).getTime(),
            type: "plan",
        });
    });

    (requestsData?.data ?? []).forEach((req) => {
        const statusLabel = req.status?.toLowerCase() === "pending" ? "submitted" : req.status?.toLowerCase();
        logs.push({
            id: `req-${req.id}`,
            action: `Travel request ${statusLabel}`,
            actor: req.status?.toLowerCase() === "pending" ? "Employee" : "Admin",
            target: req.destination,
            time: new Date(req.submittedAt || req.createdAt).toLocaleDateString(),
            sortDate: new Date(req.submittedAt || req.createdAt).getTime(),
            type: "request",
        });
    });

    // Sort by date descending
    logs.sort((a, b) => b.sortDate - a.sortDate);

    const filtered = logs.filter((l) => {
        const matchesSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || l.type === filter;
        return matchesSearch && matchesFilter;
    });

    const typeIcon = (type: string) => {
        const icons: Record<string, { icon: typeof LucideShield; color: string }> = {
            team: { icon: LucideUserPlus, color: "text-accent bg-accent/10" },
            request: { icon: LucideShield, color: "text-gold bg-gold/10" },
            plan: { icon: LucideFilePlus, color: "text-heading bg-button-secondary" },
            billing: { icon: LucideCoins, color: "text-green-600 bg-green-50" },
            settings: { icon: LucideUserCog, color: "text-muted bg-button-secondary" },
        };
        const { icon: Icon, color } = icons[type] ?? icons.settings;
        return (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
        );
    };

    const typeFilters = [
        { value: "all", label: "All Actions" },
        { value: "team", label: "Team" },
        { value: "request", label: "Requests" },
        { value: "plan", label: "Plans" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">Audit Log</h1>
                <p className="text-sm text-muted">Track all admin and HR actions within your company account</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Actions", value: logs.length, color: "text-heading" },
                    { label: "Team Actions", value: logs.filter((l) => l.type === "team").length, color: "text-accent" },
                    { label: "Request Actions", value: logs.filter((l) => l.type === "request").length, color: "text-gold" },
                    { label: "Plan Actions", value: logs.filter((l) => l.type === "plan").length, color: "text-heading" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-border-light/50 p-5">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{stat.label}</p>
                        <p className={`text-3xl font-serif ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-border-light/50 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search actions, actors, or targets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-background-primary border border-border-light rounded-xl text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {typeFilters.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    filter === f.value ? "bg-accent text-white" : "bg-button-secondary text-muted hover:bg-border-light"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : (
                    <div className="divide-y divide-border-light/50">
                        {filtered.map((log) => (
                            <div key={log.id} className="px-4 sm:px-6 py-4 flex items-start gap-4 hover:bg-background-secondary/30 transition-colors">
                                {typeIcon(log.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-heading">{log.action}</p>
                                    <p className="text-xs text-muted mt-0.5">
                                        By <span className="font-medium">{log.actor}</span> &middot; {log.target}
                                    </p>
                                </div>
                                <span className="text-xs text-muted flex-shrink-0">{log.time}</span>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-button-secondary flex items-center justify-center mx-auto mb-3">
                                    <LucideFilter className="w-6 h-6 text-muted" />
                                </div>
                                <p className="text-sm text-muted">{logs.length === 0 ? "No activity yet. Actions will appear here as your team uses the platform." : "No audit log entries match your filters"}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLog;
