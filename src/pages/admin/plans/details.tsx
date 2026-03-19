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
} from "lucide-react";
import { usePlanStore } from "../../../stores/planStore";

const PlanDetails = () => {
    const { id } = useParams();
    const plan = usePlanStore((s) => s.getPlan(id!));

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg font-serif text-heading mb-4">Plan not found</p>
                <Link to="/admin/plans" className="text-accent font-medium hover:underline flex items-center gap-2">
                    <LucideArrowLeft className="w-4 h-4" /> Back to Plans
                </Link>
            </div>
        );
    }

    const statusIcon = plan.status === "completed" ? (
        <LucideCheckCircle2 className="w-5 h-5 text-accent" />
    ) : (
        <LucideClock className="w-5 h-5 text-gold" />
    );

    const riskColor = plan.riskScore === "Low" ? "text-accent" : plan.riskScore === "Moderate" ? "text-gold" : "text-red-600";
    const riskBg = plan.riskScore === "Low" ? "bg-accent/10" : plan.riskScore === "Moderate" ? "bg-gold/10" : "bg-red-50";
    const borderColor = plan.riskScore === "Low" ? "border-accent/30" : plan.riskScore === "Moderate" ? "border-gold/30" : "border-red-200";

    const sections = [
        { icon: LucideSyringe, title: "Vaccinations", color: "accent", items: plan.vaccinations?.map((v) => ({ label: v.name, detail: v.status })) ?? [] },
        { icon: LucideAlertTriangle, title: "Health Alerts", color: "gold", items: plan.healthAlerts?.map((h) => ({ label: h, detail: "" })) ?? [] },
        { icon: LucideShield, title: "Safety Advisories", color: "accent", items: plan.safetyAdvisories?.map((s) => ({ label: s, detail: "" })) ?? [] },
        { icon: LucidePill, title: "Recommended Medications", color: "heading", items: plan.medications?.map((m) => ({ label: m, detail: "" })) ?? [] },
        { icon: LucideDroplet, title: "Food & Water Safety", color: "accent", items: plan.waterFood?.map((w) => ({ label: w, detail: "" })) ?? [] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/admin/plans" className="p-2 rounded-xl hover:bg-white transition-colors">
                    <LucideArrowLeft className="w-5 h-5 text-muted" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-serif text-heading mb-2">{plan.destination}</h1>
                    <p className="text-sm text-muted mt-0.5">{plan.country} &middot; {plan.duration}</p>
                </div>
                <div className="flex gap-2">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors">
                        <LucidePrinter className="w-4 h-4" />
                        Print
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">
                        <LucideDownload className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className={`bg-white rounded-2xl border ${borderColor} p-6`}>
                <div className="flex flex-wrap gap-3">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${riskBg} ${riskColor}`}>
                        <span className={`w-2 h-2 rounded-full ${plan.riskScore === "Low" ? "bg-accent" : plan.riskScore === "Moderate" ? "bg-gold" : "bg-red-500"}`} />
                        {plan.riskScore} Risk
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent">
                        {statusIcon}
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideUser className="w-4 h-4" />
                        {plan.employeeName ?? "Unknown"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideCalendar className="w-4 h-4" />
                        Created {plan.createdAt}
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

            {plan.emergencyContacts && plan.emergencyContacts.length > 0 && (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-light/50 flex items-center gap-2.5">
                        <LucidePhone className="w-5 h-5 text-accent" />
                        <h2 className="text-sm font-semibold text-heading">Emergency Contacts</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plan.emergencyContacts.map((ec, i) => (
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
