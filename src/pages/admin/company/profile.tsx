import { useState } from "react";
import {
    LucideBriefcase,
    LucideBuilding2,
    LucideCalendarClock,
    LucideCheck,
    LucideCoins,
    LucideCopy,
    LucideCreditCard,
    LucideKey,
    LucideLoader2,
    LucideSave,
    LucideShield,
    LucideUsers,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useUpdateCompany, useCompanySettings, useUpdateBillingCurrency, useCompanyPlans } from "../../../api/hooks";

const BILLING_CURRENCIES = [
    { value: "NGN", label: "NGN — Nigerian Naira (₦)" },
    { value: "USD", label: "USD — US Dollar ($)" },
];

const PLAN_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    essential: { bg: "bg-stone-50", border: "border-stone-200", text: "text-stone-700", glow: "from-stone-200/40" },
    standard: { bg: "bg-accent/5", border: "border-accent/20", text: "text-accent", glow: "from-accent/25" },
    premium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", glow: "from-gold/35" },
};

const cardClass = "rounded-3xl border border-border-light/60 bg-white shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)]";
const fieldClass = "w-full bg-button-secondary/70 border border-border-light rounded-2xl px-4 py-3 text-sm text-heading outline-none focus:border-accent focus:bg-white transition-colors";

function formatNumber(value: number | undefined) {
    return (value ?? 0).toLocaleString();
}

function formatDate(value: string | undefined) {
    if (!value) return "Not set";
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatPlanPrice(currency: string, ngn: number, usd: number) {
    if (currency === "USD") return `$${usd.toFixed(2)}`;
    return `₦${ngn.toLocaleString()}`;
}

type ProfileDraft = Partial<{ name: string; industry: string }>;

type ApiError = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

function getErrorMessage(error: unknown, fallback: string) {
    const message = (error as ApiError).response?.data?.message;
    return typeof message === "string" && message.length > 0 ? message : fallback;
}


const CompanyProfile = () => {
    const [copied, setCopied] = useState(false);
    const { data: myCompanies, isLoading } = useMyCompanies();
    const updateCompany = useUpdateCompany();
    const updateBillingCurrency = useUpdateBillingCurrency();
    const { data: plans } = useCompanyPlans();
    const company = myCompanies?.[0];
    const companyId = company?.id;

    const { data: settingsData } = useCompanySettings(companyId ?? 0);

    const [profileDraft, setProfileDraft] = useState<ProfileDraft>({});
    const [currencyDraft, setCurrencyDraft] = useState<string | null>(null);

    const activePlan = plans?.find(p => p.code?.toLowerCase() === company?.plan?.toLowerCase());
    const planCode = activePlan?.code?.toLowerCase() ?? company?.plan?.toLowerCase() ?? "";
    const planStyle = PLAN_STYLES[planCode] ?? PLAN_STYLES.essential;
    const planName = activePlan?.displayName ?? company?.plan ?? "No plan";
    const preferredCurrency =
        ((settingsData?.settings?.pref_currency?.value as string | undefined) ||
            company?.billing_currency ||
            "NGN");

    const formName = profileDraft.name ?? company?.name ?? "";
    const formIndustry = profileDraft.industry ?? company?.industry ?? "";
    const billingCurrency = currencyDraft ?? preferredCurrency;
    const totalCredits = company?.total_credits ?? 0;
    const usedCredits = company?.used_credits ?? 0;
    const remainingCredits = Math.max(totalCredits - usedCredits, 0);
    const creditUsagePercent = totalCredits > 0 ? Math.min((usedCredits / totalCredits) * 100, 100) : 0;
    const isSeatBilling = company?.billing_model === "SEAT";
    const apiAccessEnabled = activePlan?.serviceLevel === "PREMIUM" || planCode === "premium";
    const companyInitial = company?.name?.trim()?.charAt(0).toUpperCase() || "C";


    const hasProfileChanges =
        !!company &&
        (formName.trim() !== (company.name ?? "") ||
            formIndustry !== (company.industry ?? ""));

    const hasCurrencyChanges = !!companyId && billingCurrency !== preferredCurrency;

    const handleCopyCode = async () => {
        if (!company?.company_code) return;
        try {
            await navigator.clipboard.writeText(company.company_code);
            setCopied(true);
            toast.success("Invite code copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy invite code");
        }
    };

    const handleSave = async () => {
        if (!company) return;
        if (!formName.trim()) {
            toast.error("Organization name is required");
            return;
        }
        try {
            await updateCompany.mutateAsync({
                id: company.id,
                data: { name: formName.trim(), industry: formIndustry },
            });
            setProfileDraft({});
            toast.success("Organization profile updated successfully");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to update organization profile"));
        }
    };

    const handleSaveCurrency = async () => {
        if (!companyId) return;
        try {
            await updateBillingCurrency.mutateAsync({ companyId, currency: billingCurrency });
            setCurrencyDraft(null);
            toast.success("Billing currency updated");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to update billing currency"));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideLoader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-sm text-muted">Loading organization profile...</p>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideBuilding2 className="w-12 h-12 text-muted mb-3" />
                <p className="text-lg font-serif text-heading mb-2">No organization found</p>
                <p className="text-sm text-muted">You&apos;re not linked to any organization yet.</p>
            </div>
        );
    }

    const heroStats = isSeatBilling
        ? [
            { label: "Seats used", value: `${formatNumber(company.seats_used)} / ${formatNumber(company.seats_total)}`, icon: <LucideUsers className="w-4 h-4" /> },
            { label: "Seats remaining", value: formatNumber(company.seats_remaining), icon: <LucideBriefcase className="w-4 h-4" /> },
            { label: "Renewal", value: formatDate(company.renewal_date), icon: <LucideCalendarClock className="w-4 h-4" /> },
        ]
        : [
            { label: "Credits remaining", value: formatNumber(remainingCredits), icon: <LucideCoins className="w-4 h-4" /> },
            { label: "Credits used", value: formatNumber(usedCredits), icon: <LucideCreditCard className="w-4 h-4" /> },
            { label: "Members", value: formatNumber(company.employee_count), icon: <LucideUsers className="w-4 h-4" /> },
        ];

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-xl border border-dark/10 bg-dark text-background-primary">
                <div className={`absolute -right-28 -top-32 h-72 w-72 rounded-full bg-linear-to-br ${planStyle.glow} to-transparent blur-3xl`} />

                <div className="relative p-5 sm:p-7 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl font-serif">
                                {companyInitial}
                            </div>
                            <div className="min-w-0">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-background-primary/90">
                                        <LucideShield className="w-3.5 h-3.5" />
                                        Company profile
                                    </span>
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${planStyle.border} ${planStyle.bg} ${planStyle.text}`}>
                                        {planName}
                                    </span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight text-background-primary">
                                    {company.name}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-background-primary/70">
                                    Manage the identity, invite access, billing display, and plan posture for your travel medicine workspace.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md lg:min-w-[280px]">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background-primary/50">Invite code</p>
                                    <p className="text-xs text-background-primary/65">Share with members only</p>
                                </div>
                                <LucideKey className="w-4 h-4 text-background-primary/60" />
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="min-w-0 flex-1 rounded-xl bg-background-primary px-4 py-3 text-lg font-mono font-semibold tracking-wider text-accent">
                                    {company.company_code || "—"}
                                </code>
                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    disabled={!company.company_code}
                                    className="rounded-xl bg-background-primary p-3 text-accent transition-colors hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Copy organization invite code"
                                >
                                    {copied ? (
                                        <LucideCheck className="w-5 h-5" />
                                    ) : (
                                        <LucideCopy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {heroStats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
                                <div className="mb-3 flex items-center justify-between text-background-primary/60">
                                    <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                                    {stat.icon}
                                </div>
                                <p className="text-2xl font-serif text-background-primary tabular-nums">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
                <div className="space-y-6">
                    <section className={`${cardClass} overflow-hidden`}>
                        <div className="border-b border-border-light/60 bg-background-secondary/60 px-5 py-4 sm:px-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-heading">Organization details</h2>
                                    <p className="text-xs text-muted">Keep the workspace identity clear for members and billing records.</p>
                                </div>
                                {hasProfileChanges && (
                                    <span className="w-fit rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                                        Unsaved changes
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setProfileDraft((current) => ({ ...current, name: e.target.value }))}
                                    className={fieldClass}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Industry
                                    </label>
                                    <select
                                        value={formIndustry}
                                        onChange={(e) => setProfileDraft((current) => ({ ...current, industry: e.target.value }))}
                                        className={fieldClass}
                                    >
                                        <option value="">Select industry...</option>
                                        <option>Technology</option>
                                        <option>Healthcare</option>
                                        <option>Finance</option>
                                        <option>Manufacturing</option>
                                        <option>Consulting</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Plan
                                    </label>
                                    <input
                                        type="text"
                                        value={planName}
                                        readOnly
                                        className={`${fieldClass} cursor-default`}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border-light/60 bg-background-primary/50 p-4">
                                <p className="text-sm font-semibold text-heading">Plan changes are managed by billing</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted">
                                    This page edits company profile fields only. Subscription tier changes are handled through billing or sales workflows.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-border-light/50 px-5 py-4 sm:px-6">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={updateCompany.isPending || !hasProfileChanges}
                                    className="flex items-center gap-2 rounded-xl bg-dark px-6 py-3 text-sm font-semibold text-background-primary transition-colors duration-200 hover:bg-darkest disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updateCompany.isPending ? (
                                        <><LucideLoader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                    ) : (
                                        <><LucideSave className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className={`${cardClass} p-5 sm:p-6`}>
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-heading">Billing currency</h2>
                                <p className="text-xs text-muted">
                                    Controls the currency shown on credit purchase cards for this company.
                                </p>
                            </div>
                            <span className="w-fit rounded-full bg-button-secondary px-3 py-1 text-xs font-semibold text-heading">
                                Current: {preferredCurrency}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Currency
                                </label>
                                <select
                                    value={billingCurrency}
                                    onChange={(e) => setCurrencyDraft(e.target.value)}
                                    className={fieldClass}
                                >
                                    {BILLING_CURRENCIES.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleSaveCurrency}
                                disabled={updateBillingCurrency.isPending || !hasCurrencyChanges}
                                className="flex items-center justify-center gap-2 rounded-xl bg-dark px-6 py-3 text-sm font-semibold text-background-primary transition-colors duration-200 hover:bg-darkest disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updateBillingCurrency.isPending ? (
                                    <><LucideLoader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><LucideSave className="w-4 h-4" /> Save Currency</>
                                )}
                            </button>
                        </div>
                    </section>
                </div>

                <aside className="space-y-6">
                    <section className={`${cardClass} relative overflow-hidden p-5 sm:p-6 ${planStyle.bg} ${planStyle.border}`}>
                        <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${planStyle.glow} to-transparent blur-2xl`} />
                        <div className="relative">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Current plan</p>
                                    <h2 className="mt-1 text-2xl font-serif text-heading">{planName}</h2>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-accent">
                                    <LucideShield className="w-5 h-5" />
                                </div>
                            </div>

                            {activePlan ? (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-white/80 bg-white/75 p-4">
                                        <p className="text-xs text-muted mb-1">Price per credit</p>
                                        <p className="text-3xl font-serif text-heading">
                                            {formatPlanPrice(billingCurrency, activePlan.basePriceNgn, activePlan.basePriceUsd)}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/80 bg-white/60 p-4">
                                            <p className="text-xs text-muted mb-1">API access</p>
                                            <p className={`text-sm font-semibold ${apiAccessEnabled ? "text-success" : "text-muted"}`}>
                                                {apiAccessEnabled ? "Enabled" : "Premium only"}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-white/80 bg-white/60 p-4">
                                            <p className="text-xs text-muted mb-1">Billing model</p>
                                            <p className="text-sm font-semibold text-heading">
                                                {isSeatBilling ? "Seats" : "Credits"}
                                            </p>
                                        </div>
                                    </div>

                                    {activePlan.description && (
                                        <p className="text-xs leading-relaxed text-muted">{activePlan.description}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted">No plan information available. Contact support to set up your plan.</p>
                            )}
                        </div>
                    </section>

                    <section className={`${cardClass} p-5 sm:p-6`}>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-heading">Usage snapshot</h2>
                                <p className="text-xs text-muted">Live allocation and consumption totals.</p>
                            </div>
                            <LucideCoins className="w-5 h-5 text-accent" />
                        </div>

                        {isSeatBilling ? (
                            <div className="space-y-3">
                                {[
                                    { label: "Total seats", value: formatNumber(company.seats_total) },
                                    { label: "Used seats", value: formatNumber(company.seats_used) },
                                    { label: "Extra plans", value: formatNumber(company.extra_plans_purchased) },
                                    { label: "Status", value: company.subscription_status ?? "Active" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-2xl bg-background-primary/60 px-4 py-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{item.label}</span>
                                        <span className="text-sm font-semibold text-heading tabular-nums">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                        <span className="font-semibold uppercase tracking-wider text-muted">Credit usage</span>
                                        <span className="font-semibold text-heading">{Math.round(creditUsagePercent)}%</span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-button-secondary">
                                        <div
                                            className="h-full rounded-full bg-accent transition-all"
                                            style={{ width: `${creditUsagePercent}%` }}
                                        />
                                    </div>
                                </div>

                                {[
                                    { label: "Available", value: formatNumber(remainingCredits) },
                                    { label: "Used", value: formatNumber(usedCredits) },
                                    { label: "Purchased total", value: formatNumber(totalCredits) },
                                    { label: "Members", value: formatNumber(company.employee_count) },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between rounded-2xl bg-background-primary/60 px-4 py-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{item.label}</span>
                                        <span className="text-sm font-semibold text-heading tabular-nums">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default CompanyProfile;
