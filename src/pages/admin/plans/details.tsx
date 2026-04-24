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

type GeneratedPlanJson = {
    reportTitle?: string;
    travellerName?: string;
    travelDates?: string;
    overallRiskLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    healthRiskOverview?: { category?: string; level?: string; summary?: string }[];
    vaccinations?: { vaccine?: string; status?: string; recommendation?: string }[];
    recommendations?: { title?: string; details?: string }[];
    clinicalFlags?: string[];
    contraindications?: string[];
    hardStop?: {
        conditionTriggered?: string;
        reason?: string;
        recommendedSpecialist?: string;
    } | null;
    tripAtGlance?: {
        durationDays?: number;
        purpose?: string;
        travelling?: string;
        accommodation?: string;
        insurance?: string;
    };
    malariaPrevention?: {
        riskLevel?: string;
        recommendedAgent?: string;
        rationale?: string;
        mosquitoProtection?: string[];
        contraindications?: string;
    } | null;
    specialistReferrals?: {
        condition?: string;
        specialist?: string;
        urgency?: "ROUTINE" | "BEFORE_TRAVEL" | "URGENT";
    }[];
    flightHealth?: {
        vteRiskLevel?: string;
        preventionMeasures?: string[];
        medifClearanceRequired?: boolean;
        medicationTimingGuidance?: string;
    } | null;
    medicalConditions?: { condition?: string; precautions?: string }[];
    medicationLogistics?: {
        packaging?: string;
        supplyRule?: string;
        destinationLegalityCheck?: boolean;
        coldChainRequired?: boolean;
    };
    sexualHealth?: {
        riskLevel?: string;
        preventionAdvice?: string[];
        prepPepDiscussion?: boolean;
    } | null;
    pregnancyGuidance?: {
        trimesterSpecificAdvice?: string;
        liveVaccineContraindications?: string[];
        antimalarialSafety?: string;
        airlineRestrictions?: string;
        contraceptionCounselling?: string;
    } | null;
    afterReturn?: {
        within1Week?: string[];
        within4Weeks?: string[];
        beyond4Weeks?: string[];
        redFlag?: string;
    };
    medicalCare?: {
        clinics?: { name?: string; address?: string; phone?: string; distance?: string; notes?: string }[];
        embassyContacts?: { name?: string; details?: string }[];
        emergencyContacts?: { label?: string; value?: string }[];
    };
    itineraryGuidance?: {
        tripType?: "ONE_WAY" | "RETURN" | "MULTI_STOP";
        summary?: string;
        routeAdvice?: { stop?: string; country?: string; guidance?: string }[];
        returnGuidance?: string[];
    };
    nextSteps?: string[];
    medicalDisclaimer?: string;
};

function parseGeneratedPlanJson(raw: unknown): GeneratedPlanJson | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === "string") {
        try {
            return JSON.parse(raw) as GeneratedPlanJson;
        } catch {
            return null;
        }
    }

    return raw as GeneratedPlanJson;
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
    const generatedPlanJson = parseGeneratedPlanJson(plan.generatedPlan?.planJson);

    const mergedVaccinations =
        (generatedPlanJson?.vaccinations ?? []).map((v) => ({
            name: v.vaccine ?? "Unnamed vaccine",
            status: v.status ?? v.recommendation ?? "Recommended",
        })) || [];

    const mergedHealthAlerts =
        (generatedPlanJson?.healthRiskOverview ?? []).map((risk) =>
            [risk.category, risk.level, risk.summary].filter(Boolean).join(": ")
        ) || [];

    const mergedSafetyAdvisories = [
        ...(generatedPlanJson?.recommendations ?? []).map((r) =>
            [r.title, r.details].filter(Boolean).join(" - ")
        ),
        ...(generatedPlanJson?.clinicalFlags ?? []),
    ].filter(Boolean);

    const mergedMedications = [
        ...(generatedPlanJson?.malariaPrevention?.recommendedAgent
            ? [`Malaria prophylaxis: ${generatedPlanJson.malariaPrevention.recommendedAgent}`]
            : []),
        ...(generatedPlanJson?.medicationLogistics?.packaging
            ? [`Packaging: ${generatedPlanJson.medicationLogistics.packaging}`]
            : []),
        ...(generatedPlanJson?.medicationLogistics?.supplyRule
            ? [`Supply: ${generatedPlanJson.medicationLogistics.supplyRule}`]
            : []),
        ...(generatedPlanJson?.contraindications ?? []).map((c) => `Contraindication: ${c}`),
    ];

    const mergedWaterFood = generatedPlanJson?.malariaPrevention?.mosquitoProtection ?? [];

    const mergedEmergencyContacts =
        (generatedPlanJson?.medicalCare?.emergencyContacts ?? [])
            .filter((ec) => ec.label && ec.value)
            .map((ec) => ({ label: ec.label as string, value: ec.value as string })) || [];

    const displayVaccinations = mergedVaccinations.length > 0 ? mergedVaccinations : vaccinations;
    const displayHealthAlerts = mergedHealthAlerts.length > 0 ? mergedHealthAlerts : healthAlerts;
    const displaySafetyAdvisories = mergedSafetyAdvisories.length > 0 ? mergedSafetyAdvisories : safetyAdvisories;
    const safetySection = { icon: LucideShield, title: "Safety Advisories", color: "accent", items: displaySafetyAdvisories.map((s) => ({ label: s, detail: "" })) };
    const displayMedications = mergedMedications.length > 0 ? mergedMedications : medications;
    const displayWaterFood = mergedWaterFood.length > 0 ? mergedWaterFood : waterFood;
    const displayEmergencyContacts = mergedEmergencyContacts.length > 0 ? mergedEmergencyContacts : emergencyContacts;
    const routeAdviceItems = (generatedPlanJson?.itineraryGuidance?.routeAdvice ?? []).map((route) =>
        [route.stop, route.country, route.guidance].filter(Boolean).join(" - ")
    ).filter(Boolean);
    const specialistReferralItems = (generatedPlanJson?.specialistReferrals ?? []).map((referral) =>
        [referral.condition, referral.specialist, referral.urgency].filter(Boolean).join(" - ")
    ).filter(Boolean);
    const medicalConditionItems = (generatedPlanJson?.medicalConditions ?? []).map((condition) =>
        [condition.condition, condition.precautions].filter(Boolean).join(": ")
    ).filter(Boolean);

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

    const primarySections = [
        { icon: LucideSyringe, title: "Vaccinations", color: "accent", items: displayVaccinations.map((v) => ({ label: v.name, detail: v.status })) },
        { icon: LucideAlertTriangle, title: "Health Alerts", color: "gold", items: displayHealthAlerts.map((h) => ({ label: h, detail: "" })) },
    ];
    const medicationsSection = { icon: LucidePill, title: "Recommended Medications", color: "heading", items: displayMedications.map((m) => ({ label: m, detail: "" })) };
    const foodWaterSection = { icon: LucideDroplet, title: "Food & Water Safety", color: "accent", items: displayWaterFood.map((w) => ({ label: w, detail: "" })) };

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

            <div className={`rounded-3xl bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] border ${borderColor} p-6`}>
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

            {(generatedPlanJson?.reportTitle || generatedPlanJson?.travellerName || generatedPlanJson?.travelDates || generatedPlanJson?.tripAtGlance) && (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-light/50">
                        <h2 className="text-sm font-semibold text-heading">Trip Overview</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedPlanJson?.reportTitle && <div className="text-sm"><span className="text-muted">Report:</span> <span className="text-heading">{generatedPlanJson.reportTitle}</span></div>}
                        {generatedPlanJson?.travellerName && <div className="text-sm"><span className="text-muted">Traveller:</span> <span className="text-heading">{generatedPlanJson.travellerName}</span></div>}
                        {generatedPlanJson?.travelDates && <div className="text-sm"><span className="text-muted">Travel Dates:</span> <span className="text-heading">{generatedPlanJson.travelDates}</span></div>}
                        {generatedPlanJson?.tripAtGlance?.travelling && <div className="text-sm"><span className="text-muted">Travelling:</span> <span className="text-heading">{generatedPlanJson.tripAtGlance.travelling}</span></div>}
                        {generatedPlanJson?.tripAtGlance?.accommodation && <div className="text-sm"><span className="text-muted">Accommodation:</span> <span className="text-heading">{generatedPlanJson.tripAtGlance.accommodation}</span></div>}
                        {generatedPlanJson?.tripAtGlance?.insurance && <div className="text-sm"><span className="text-muted">Insurance:</span> <span className="text-heading">{generatedPlanJson.tripAtGlance.insurance}</span></div>}
                    </div>
                </div>
            )}

            {(generatedPlanJson?.hardStop || generatedPlanJson?.medicalDisclaimer) && (
                <div className="rounded-3xl bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] border border-red-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-red-100 bg-red-50/50">
                        <h2 className="text-sm font-semibold text-red-700">Critical Advisory</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {generatedPlanJson?.hardStop && (
                            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm">
                                <p className="font-semibold text-red-700">{generatedPlanJson.hardStop.conditionTriggered ?? "Hard stop condition"}</p>
                                {generatedPlanJson.hardStop.reason && <p className="text-red-700/90 mt-1">{generatedPlanJson.hardStop.reason}</p>}
                                {generatedPlanJson.hardStop.recommendedSpecialist && (
                                    <p className="text-red-700/90 mt-1">Recommended specialist: {generatedPlanJson.hardStop.recommendedSpecialist}</p>
                                )}
                            </div>
                        )}
                        {generatedPlanJson?.medicalDisclaimer && (
                            <p className="text-sm text-muted">{generatedPlanJson.medicalDisclaimer}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {primarySections.map((section) => (
                    <div key={section.title} className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
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
                                        <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 shrink-0" />
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {generatedPlanJson?.malariaPrevention && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50">
                            <h2 className="text-sm font-semibold text-heading">Malaria Prevention</h2>
                        </div>
                        <div className="p-5 space-y-2 text-sm">
                            {generatedPlanJson.malariaPrevention.riskLevel && <p><span className="text-muted">Risk:</span> <span className="text-heading">{generatedPlanJson.malariaPrevention.riskLevel}</span></p>}
                            {generatedPlanJson.malariaPrevention.recommendedAgent && <p><span className="text-muted">Agent:</span> <span className="text-heading">{generatedPlanJson.malariaPrevention.recommendedAgent}</span></p>}
                            {generatedPlanJson.malariaPrevention.rationale && <p className="text-heading">{generatedPlanJson.malariaPrevention.rationale}</p>}
                            {generatedPlanJson.malariaPrevention.contraindications && <p className="text-heading">Contraindications: {generatedPlanJson.malariaPrevention.contraindications}</p>}
                        </div>
                    </div>
                )}

                {medicationsSection.items.length > 0 && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50 flex items-center gap-2.5">
                            <medicationsSection.icon className={`w-5 h-5 text-${medicationsSection.color}`} />
                            <h2 className="text-sm font-semibold text-heading">{medicationsSection.title}</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {medicationsSection.items.map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 shrink-0" />
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
                            ))}
                        </div>
                    </div>
                )}

                {generatedPlanJson?.flightHealth && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50">
                            <h2 className="text-sm font-semibold text-heading">Flight Health</h2>
                        </div>
                        <div className="p-5 space-y-2 text-sm">
                            {generatedPlanJson.flightHealth.vteRiskLevel && <p><span className="text-muted">VTE Risk:</span> <span className="text-heading">{generatedPlanJson.flightHealth.vteRiskLevel}</span></p>}
                            <p><span className="text-muted">MEDIF Clearance:</span> <span className="text-heading">{generatedPlanJson.flightHealth.medifClearanceRequired ? "Required" : "Not required"}</span></p>
                            {generatedPlanJson.flightHealth.medicationTimingGuidance && <p className="text-heading">{generatedPlanJson.flightHealth.medicationTimingGuidance}</p>}
                            {(generatedPlanJson.flightHealth.preventionMeasures ?? []).length > 0 && (
                                <ul className="list-disc pl-5 space-y-1 text-heading">
                                    {(generatedPlanJson.flightHealth.preventionMeasures ?? []).map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {foodWaterSection.items.length > 0 && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50 flex items-center gap-2.5">
                            <foodWaterSection.icon className={`w-5 h-5 text-${foodWaterSection.color}`} />
                            <h2 className="text-sm font-semibold text-heading">{foodWaterSection.title}</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {foodWaterSection.items.map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 shrink-0" />
                                    <p className="text-sm text-heading leading-snug">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {safetySection.items.length > 0 && (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-light/50 flex items-center gap-2.5">
                        <safetySection.icon className={`w-5 h-5 text-${safetySection.color}`} />
                        <h2 className="text-sm font-semibold text-heading">{safetySection.title}</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {safetySection.items.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 shrink-0" />
                                <p className="text-sm text-heading leading-snug">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(generatedPlanJson?.itineraryGuidance || routeAdviceItems.length > 0) && (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-light/50">
                        <h2 className="text-sm font-semibold text-heading">Itinerary Guidance</h2>
                    </div>
                    <div className="p-5 space-y-2 text-sm">
                        {generatedPlanJson?.itineraryGuidance?.tripType && <p><span className="text-muted">Trip Type:</span> <span className="text-heading">{generatedPlanJson.itineraryGuidance.tripType}</span></p>}
                        {generatedPlanJson?.itineraryGuidance?.summary && <p className="text-heading">{generatedPlanJson.itineraryGuidance.summary}</p>}
                        {routeAdviceItems.length > 0 && (
                            <ul className="list-disc pl-5 space-y-1 text-heading">
                                {routeAdviceItems.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                        )}
                        {(generatedPlanJson?.itineraryGuidance?.returnGuidance ?? []).length > 0 && (
                            <p className="text-heading"><span className="text-muted">Return guidance:</span> {(generatedPlanJson?.itineraryGuidance?.returnGuidance ?? []).join("; ")}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(specialistReferralItems.length > 0 || medicalConditionItems.length > 0) && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50">
                            <h2 className="text-sm font-semibold text-heading">Clinical Notes</h2>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                            {specialistReferralItems.length > 0 && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted mb-2">Specialist Referrals</p>
                                    <ul className="list-disc pl-5 space-y-1 text-heading">
                                        {specialistReferralItems.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                            {medicalConditionItems.length > 0 && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted mb-2">Medical Conditions</p>
                                    <ul className="list-disc pl-5 space-y-1 text-heading">
                                        {medicalConditionItems.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(generatedPlanJson?.afterReturn?.within1Week || generatedPlanJson?.afterReturn?.within4Weeks || generatedPlanJson?.afterReturn?.beyond4Weeks || generatedPlanJson?.afterReturn?.redFlag) && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50">
                            <h2 className="text-sm font-semibold text-heading">After Return Guidance</h2>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                            {(generatedPlanJson?.afterReturn?.within1Week ?? []).length > 0 && <p className="text-heading"><span className="text-muted">Within 1 week:</span> {(generatedPlanJson?.afterReturn?.within1Week ?? []).join("; ")}</p>}
                            {(generatedPlanJson?.afterReturn?.within4Weeks ?? []).length > 0 && <p className="text-heading"><span className="text-muted">Within 4 weeks:</span> {(generatedPlanJson?.afterReturn?.within4Weeks ?? []).join("; ")}</p>}
                            {(generatedPlanJson?.afterReturn?.beyond4Weeks ?? []).length > 0 && <p className="text-heading"><span className="text-muted">Beyond 4 weeks:</span> {(generatedPlanJson?.afterReturn?.beyond4Weeks ?? []).join("; ")}</p>}
                            {generatedPlanJson?.afterReturn?.redFlag && <p className="text-red-700 font-medium">{generatedPlanJson.afterReturn.redFlag}</p>}
                        </div>
                    </div>
                )}

                {displayEmergencyContacts.length > 0 && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50 flex items-center gap-2.5">
                            <LucidePhone className="w-5 h-5 text-accent" />
                            <h2 className="text-sm font-semibold text-heading">Emergency Contacts</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            {displayEmergencyContacts.map((ec, i) => (
                                <div key={i} className="p-3 rounded-xl bg-background-primary">
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{ec.label}</p>
                                    <p className="text-sm font-medium text-heading">{ec.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(generatedPlanJson?.nextSteps ?? []).length > 0 && (
                    <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light/50">
                            <h2 className="text-sm font-semibold text-heading">Next Steps</h2>
                        </div>
                        <div className="p-5">
                            <ul className="list-disc pl-5 space-y-1 text-sm text-heading">
                                {(generatedPlanJson?.nextSteps ?? []).map((step, idx) => <li key={idx}>{step}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanDetails;
