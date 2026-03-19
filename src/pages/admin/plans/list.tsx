import { useState } from "react";
import { Link } from "react-router-dom";
import { LucideSearch, LucidePlus, LucideMapPin, LucideCalendar, LucideChevronRight, LucideUser } from "lucide-react";
import { usePlanStore } from "../../../stores/planStore";

const TravelPlans = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "processing">("all");
    const plans = usePlanStore((s) => s.plans);

    const filtered = plans.filter((p) => {
        const matchesSearch =
            p.destination.toLowerCase().includes(search.toLowerCase()) ||
            p.country.toLowerCase().includes(search.toLowerCase()) ||
            (p.employeeName?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const riskBadge = (risk: string) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            risk === "Low" ? "bg-accent/10 text-accent" :
            risk === "Moderate" ? "bg-gold/10 text-gold" :
            "bg-red-50 text-red-600"
        }`}>
            {risk} Risk
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">Travel Plans</h1>
                    <p className="text-sm text-muted">View and manage all employee travel health plans</p>
                </div>
                <Link
                    to="/admin/plans/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors self-start"
                >
                    <LucidePlus className="w-4 h-4" />
                    Create Plan
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by destination, country, or employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-background-primary border border-border-light rounded-xl text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "completed", "processing"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    statusFilter === f ? "bg-accent text-white" : "bg-button-secondary text-muted hover:bg-border-light"
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border-light/50 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-button-secondary flex items-center justify-center mx-auto mb-4">
                        <LucideMapPin className="w-7 h-7 text-muted" />
                    </div>
                    <p className="text-base font-semibold text-heading mb-1">No travel plans found</p>
                    <p className="text-sm text-muted mb-4">Try adjusting your search or filters</p>
                    <Link
                        to="/admin/plans/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                    >
                        <LucidePlus className="w-4 h-4" />
                        Create First Plan
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((plan) => (
                        <Link
                            key={plan.id}
                            to={`/admin/plans/${plan.id}`}
                            className="bg-white rounded-2xl border border-border-light/50 p-5 hover:border-accent/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                        plan.riskScore === "Low" ? "bg-accent" :
                                        plan.riskScore === "Moderate" ? "bg-gold" : "bg-red-500"
                                    }`} />
                                    <span className="text-sm font-semibold text-heading">{plan.destination}</span>
                                </div>
                                <LucideChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {riskBadge(plan.riskScore)}
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    plan.status === "completed" ? "bg-accent/10 text-accent" :
                                    plan.status === "processing" ? "bg-gold/10 text-gold" :
                                    "bg-button-secondary text-muted"
                                }`}>
                                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <LucideMapPin className="w-3.5 h-3.5" />
                                    {plan.country}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <LucideCalendar className="w-3.5 h-3.5" />
                                    {plan.duration}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <LucideUser className="w-3.5 h-3.5" />
                                    {plan.employeeName ?? "Unknown"}
                                </div>
                            </div>

                            {plan.vaccinations && plan.vaccinations.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border-light/50">
                                    <div className="flex flex-wrap gap-1">
                                        {plan.vaccinations.slice(0, 3).map((v, i) => (
                                            <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                v.status === "Required" ? "bg-red-50 text-red-600" :
                                                v.status === "Recommended" ? "bg-gold/10 text-gold" :
                                                "bg-button-secondary text-muted"
                                            }`}>
                                                {v.name}
                                            </span>
                                        ))}
                                        {plan.vaccinations.length > 3 && (
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-button-secondary text-muted">
                                                +{plan.vaccinations.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TravelPlans;
