import { useState } from "react";
import { LucideSearch,     LucideFilter, LucideShield, LucideUserCog, LucideCoins, LucideFilePlus, LucideUserPlus } from "lucide-react";

const AuditLog = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string>("all");

    const logs = [
        { id: 1, action: "Team member invited", actor: "Admin User", target: "priya@techcorp.com", time: "2 minutes ago", type: "team" },
        { id: 2, action: "Travel request approved", actor: "Admin User", target: "Anna Chen — Singapore", time: "15 minutes ago", type: "request" },
        { id: 3, action: "Travel plan created", actor: "Admin User", target: "Tokyo & Osaka — Michael Osei", time: "1 hour ago", type: "plan" },
        { id: 4, action: "Credits purchased", actor: "Admin User", target: "100 credits", time: "2 hours ago", type: "billing" },
        { id: 5, action: "Employee role changed", actor: "Admin User", target: "John Doe → Admin", time: "5 hours ago", type: "team" },
        { id: 6, action: "Travel request rejected", actor: "Admin User", target: "David Kim — Berlin", time: "1 day ago", type: "request" },
        { id: 7, action: "Company profile updated", actor: "Admin User", target: "Industry changed to Technology", time: "1 day ago", type: "settings" },
        { id: 8, action: "Bulk invite sent", actor: "Admin User", target: "12 employees", time: "2 days ago", type: "team" },
        { id: 9, action: "Invoice downloaded", actor: "Admin User", target: "INV-2026-001", time: "3 days ago", type: "billing" },
        { id: 10, action: "Travel plan downloaded", actor: "Admin User", target: "Nairobi & Maasai Mara", time: "4 days ago", type: "plan" },
    ];

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
        { value: "billing", label: "Billing" },
        { value: "settings", label: "Settings" },
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
                    { label: "Billing Actions", value: logs.filter((l) => l.type === "billing").length, color: "text-green-600" },
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
                            <p className="text-sm text-muted">No audit log entries match your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
