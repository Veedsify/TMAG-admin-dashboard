import { useState } from "react";
import { LucideSearch, LucideCheckCircle, LucideClock, LucideCircle, LucideSend, LucideUserPlus } from "lucide-react";
import toast from "react-hot-toast";

const OnboardingStatus = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "completed" | "in_progress" | "not_started">("all");

    const members = [
        { id: 1, name: "Sarah Chen", email: "sarah@techcorp.com", department: "Engineering", invitedAt: "Feb 28, 2026", onboardingStatus: "completed", questionnaire: "completed" },
        { id: 2, name: "John Doe", email: "john@techcorp.com", department: "Sales", invitedAt: "Mar 1, 2026", onboardingStatus: "completed", questionnaire: "completed" },
        { id: 3, name: "Emma Wilson", email: "emma@techcorp.com", department: "Marketing", invitedAt: "Mar 5, 2026", onboardingStatus: "in_progress", questionnaire: "not_started" },
        { id: 4, name: "Michael Brown", email: "michael@techcorp.com", department: "Finance", invitedAt: "Mar 8, 2026", onboardingStatus: "in_progress", questionnaire: "in_progress" },
        { id: 5, name: "Priya Patel", email: "priya@techcorp.com", department: "HR", invitedAt: "Mar 10, 2026", onboardingStatus: "not_started", questionnaire: "not_started" },
        { id: 6, name: "Alex Kim", email: "alex@techcorp.com", department: "Engineering", invitedAt: "Mar 12, 2026", onboardingStatus: "not_started", questionnaire: "not_started" },
    ];

    const filtered = members.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || m.onboardingStatus === filter;
        return matchesSearch && matchesFilter;
    });

    const statusIcon = (status: string) => {
        if (status === "completed") return <LucideCheckCircle className="w-4 h-4 text-accent" />;
        if (status === "in_progress") return <LucideClock className="w-4 h-4 text-gold" />;
        return <LucideCircle className="w-4 h-4 text-muted" />;
    };

    const statusBadge = (status: string, label: string) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            status === "completed" ? "bg-accent/10 text-accent" :
            status === "in_progress" ? "bg-gold/10 text-gold" :
            "bg-button-secondary text-muted"
        }`}>
            {statusIcon(status)} {label}
        </span>
    );

    const completedCount = members.filter((m) => m.onboardingStatus === "completed").length;
    const inProgressCount = members.filter((m) => m.onboardingStatus === "in_progress").length;
    const notStartedCount = members.filter((m) => m.onboardingStatus === "not_started").length;

    const handleRemind = (email: string) => {
        toast.success(`Reminder sent to ${email}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">Onboarding Status</h1>
                    <p className="text-sm text-muted">Track employee onboarding and questionnaire completion</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Completed</span>
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideCheckCircle className="w-5 h-5 text-accent" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif text-heading">{completedCount}</p>
                    <p className="text-xs text-muted mt-1">{((completedCount / members.length) * 100).toFixed(0)}% of team</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">In Progress</span>
                        <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                            <LucideClock className="w-5 h-5 text-gold" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif text-heading">{inProgressCount}</p>
                    <p className="text-xs text-muted mt-1">Need to complete</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Not Started</span>
                        <div className="w-9 h-9 rounded-xl bg-button-secondary flex items-center justify-center">
                            <LucideCircle className="w-5 h-5 text-muted" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif text-heading">{notStartedCount}</p>
                    <p className="text-xs text-muted mt-1">Awaiting response</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-border-light/50 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-background-primary border border-border-light rounded-xl text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "completed", "in_progress", "not_started"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    filter === f ? "bg-accent text-white" : "bg-button-secondary text-muted hover:bg-border-light"
                                }`}
                            >
                                {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f === "not_started" ? "Not Started" : "Completed"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-border-light/50">
                                {["Member", "Department", "Invited", "Onboarding", "Questionnaire", "Actions"].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/50">
                            {filtered.map((member) => (
                                <tr key={member.id} className="hover:bg-background-secondary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold text-accent">{member.name.split(" ").map((n) => n[0]).join("")}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-heading">{member.name}</p>
                                                <p className="text-xs text-muted">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted">{member.department}</td>
                                    <td className="px-6 py-4 text-sm text-muted">{member.invitedAt}</td>
                                    <td className="px-6 py-4">{statusBadge(member.onboardingStatus, member.onboardingStatus === "not_started" ? "Not Started" : member.onboardingStatus === "in_progress" ? "In Progress" : "Completed")}</td>
                                    <td className="px-6 py-4">{statusBadge(member.questionnaire, member.questionnaire === "not_started" ? "Not Started" : member.questionnaire === "in_progress" ? "In Progress" : "Completed")}</td>
                                    <td className="px-6 py-4">
                                        {member.onboardingStatus !== "completed" && (
                                            <button
                                                onClick={() => handleRemind(member.email)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
                                            >
                                                <LucideSend className="w-3.5 h-3.5" />
                                                Remind
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="w-12 h-12 rounded-full bg-button-secondary flex items-center justify-center mx-auto mb-3">
                                            <LucideUserPlus className="w-6 h-6 text-muted" />
                                        </div>
                                        <p className="text-sm text-muted">No team members match your filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OnboardingStatus;
