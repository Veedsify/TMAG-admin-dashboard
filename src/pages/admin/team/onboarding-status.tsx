import { useState } from "react";
import { LucideSearch, LucideCheckCircle, LucideClock, LucideCircle, LucideUserPlus, LucideLoader2, LucideSend } from "lucide-react";
import toast from "react-hot-toast";
import { useEmployees, useMyCompanies } from "../../../api/hooks";

function deriveOnboardingStatus(status: string, creditsUsed: number, plansGenerated: number) {
    if (status === "active" && (creditsUsed > 0 || plansGenerated > 0)) return "completed" as const;
    if (status === "active") return "in_progress" as const;
    return "not_started" as const;
}

function deriveQuestionnaireStatus(status: string, creditsUsed: number) {
    if (status === "active" && creditsUsed > 0) return "completed" as const;
    if (status === "active") return "in_progress" as const;
    return "not_started" as const;
}

const OnboardingStatus = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "completed" | "in_progress" | "not_started">("all");
    const { data: myCompanies } = useMyCompanies();
    const companyId = myCompanies?.[0]?.id;
    const { data: employeesData, isLoading } = useEmployees(
        companyId ? { companyId, per_page: 100 } : undefined
    );

    const employees = employeesData?.data ?? [];

    const members = employees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        invitedAt: new Date(emp.createdAt).toLocaleDateString(),
        onboardingStatus: deriveOnboardingStatus(emp.status, emp.creditsUsed, emp.plansGenerated),
        questionnaire: deriveQuestionnaireStatus(emp.status, emp.creditsUsed),
    }));

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Onboarding Status</h1>
                    <p className="text-sm text-muted mt-1">Track employee onboarding and questionnaire completion</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Completed</span>
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideCheckCircle className="w-5 h-5 text-accent" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">{completedCount}</p>
                    <p className="text-xs text-muted mt-1">{members.length > 0 ? ((completedCount / members.length) * 100).toFixed(0) : 0}% of team</p>
                </div>
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">In Progress</span>
                        <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                            <LucideClock className="w-5 h-5 text-gold" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">{inProgressCount}</p>
                    <p className="text-xs text-muted mt-1">Need to complete</p>
                </div>
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Not Started</span>
                        <div className="w-9 h-9 rounded-xl bg-button-secondary flex items-center justify-center">
                            <LucideCircle className="w-5 h-5 text-muted" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">{notStartedCount}</p>
                    <p className="text-xs text-muted mt-1">Awaiting response</p>
                </div>
            </div>

            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-border-light/50 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "completed", "in_progress", "not_started"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    filter === f ? "bg-dark text-background-primary" : "bg-button-secondary text-muted hover:bg-border-light"
                                }`}
                            >
                                {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f === "not_started" ? "Not Started" : "Completed"}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : (
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
                                            <p className="text-sm text-muted">{members.length === 0 ? "No team members yet. Invite your first employee." : "No team members match your filters"}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingStatus;
