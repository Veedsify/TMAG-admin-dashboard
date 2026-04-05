import { useParams, Link } from "react-router-dom";
import {
    LucideArrowLeft,
    LucideMapPin,
    LucideCalendar,
    LucideUser,
    LucideSyringe,
    LucideAlertTriangle,
    LucideShield,
    LucidePill,
    LucideDroplet,
    LucidePhone,
    LucideDownload,
    LucidePrinter,
    LucideClock,
    LucideCheckCircle2,
    LucideLoader2,
} from "lucide-react";
import { useTravelPlan, useEmployee } from "../../../api/hooks";

function parseJsonField<T>(raw: string | undefined, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

const PlanDetails = () => {
    const { id } = useParams();
    const planId = Number(id);
    const { data: plan, isLoading, isError } = useTravelPlan(planId);
    const { data: employee } = useEmployee(plan?.employeeId ?? 0);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideLoader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-sm text-muted">Loading plan details...</p>
            </div>
        );
    }

    if (isError || !plan) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg font-serif text-heading mb-4">Plan not found</p>
                <Link to="/admin/plans" className="text-accent font-medium hover:underline flex items-center gap-2">
                    <LucideArrowLeft className="w-4 h-4" /> Back to Plans
                </Link>
            </div>
        );
    }

    const vaccinations = parseJsonField<{ name: string; status: string }[]>(plan.vaccinations, []);
    const healthAlerts = parseJsonField<string[]>(plan.healthAlerts, []);
    const safetyAdvisories = parseJsonField<string[]>(plan.safetyAdvisories, []);
    const medications = parseJsonField<string[]>(plan.medications, []);
    const waterFood = parseJsonField<string[]>(plan.waterFood, []);
    const emergencyContacts = parseJsonField<{ label: string; value: string }[]>(plan.emergencyContacts, []);

    const riskLabel = plan.riskScore <= 2 ? "Low" : plan.riskScore <= 5 ? "Moderate" : "High";
    const riskColor = riskLabel === "Low" ? "text-accent" : riskLabel === "Moderate" ? "text-gold" : "text-red-600";
    const riskBg = riskLabel === "Low" ? "bg-accent/10" : riskLabel === "Moderate" ? "bg-gold/10" : "bg-red-50";
    const borderColor = riskLabel === "Low" ? "border-accent/30" : riskLabel === "Moderate" ? "border-gold/30" : "border-red-200";
    const dotColor = riskLabel === "Low" ? "bg-accent" : riskLabel === "Moderate" ? "bg-gold" : "bg-red-500";

    const statusIcon = plan.status === "COMPLETED" ? (
        <LucideCheckCircle2 className="w-5 h-5 text-accent" />
    ) : (
        <LucideClock className="w-5 h-5 text-gold" />
    );

    const sections = [
        { icon: LucideSyringe, title: "Vaccinations", color: "accent", items: vaccinations.map((v) => ({ label: v.name, detail: v.status })) },
        { icon: LucideAlertTriangle, title: "Health Alerts", color: "gold", items: healthAlerts.map((h) => ({ label: h, detail: "" })) },
        { icon: LucideShield, title: "Safety Advisories", color: "accent", items: safetyAdvisories.map((s) => ({ label: s, detail: "" })) },
        { icon: LucidePill, title: "Recommended Medications", color: "heading", items: medications.map((m) => ({ label: m, detail: "" })) },
        { icon: LucideDroplet, title: "Food & Water Safety", color: "accent", items: waterFood.map((w) => ({ label: w, detail: "" })) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <Link to="/admin/plans" className="p-2 rounded-xl hover:bg-white transition-colors">
                    <LucideArrowLeft className="w-5 h-5 text-muted" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading truncate">{plan.destination}</h1>
                    <p className="text-sm text-muted mt-1">{plan.country} &middot; {plan.duration} day{plan.duration !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors">
                        <LucidePrinter className="w-4 h-4" />
                        Print
                    </button>
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200">
                        <LucideDownload className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className={`bg-white rounded-2xl border ${borderColor} p-6`}>
                <div className="flex flex-wrap gap-3">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${riskBg} ${riskColor}`}>
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        {riskLabel} Risk
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent">
                        {statusIcon}
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1).toLowerCase()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideUser className="w-4 h-4" />
                        {employee?.name ?? "Unknown"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideCalendar className="w-4 h-4" />
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideMapPin className="w-4 h-4" />
                        {plan.purpose}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sections.map((section) => (
                    <div key={section.title} className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50 flex items-center gap-2.5">
                            <section.icon className={`w-5 h-5 text-${section.color}`} />
                            <h2 className="text-sm font-semibold text-heading">{section.title}</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {section.items.length === 0 ? (
                                <p className="text-sm text-muted italic">No items</p>
                            ) : (
                                section.items.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-heading leading-snug">{item.label}</p>
                                            {item.detail && (
                                                <span className={`inline-block mt-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                                                    item.detail === "Required" ? "bg-red-50 text-red-600" :
                                                    item.detail === "Recommended" ? "bg-gold/10 text-gold" :
                                                    "bg-button-secondary text-muted"
                                                }`}>
                                                    {item.detail}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {emergencyContacts.length > 0 && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-light/50 flex items-center gap-2.5">
                        <LucidePhone className="w-5 h-5 text-accent" />
                        <h2 className="text-sm font-semibold text-heading">Emergency Contacts</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {emergencyContacts.map((ec, i) => (
                            <div key={i} className="p-4 rounded-xl bg-background-primary">
                                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{ec.label}</p>
                                <p className="text-sm font-medium text-heading">{ec.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanDetails;
