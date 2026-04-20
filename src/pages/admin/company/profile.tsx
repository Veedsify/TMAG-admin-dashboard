import { useState, useEffect } from "react";
import { LucideBuilding2, LucideSave, LucideCopy, LucideCheck, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useUpdateCompany, useCompanySettings, useUpdateBillingCurrency, useCompanyPlans } from "../../../api/hooks";

const BILLING_CURRENCIES = [
    { value: "NGN", label: "NGN — Nigerian Naira (₦)" },
    { value: "USD", label: "USD — US Dollar ($)" },
];

const PLAN_STYLES: Record<string, { bg: string; border: string; text: string }> = {
    essential: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
    standard: { bg: "bg-accent/5", border: "border-accent/20", text: "text-accent" },
    premium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
};

const CompanyProfile = () => {
    const [copied, setCopied] = useState(false);
    const { data: myCompanies, isLoading } = useMyCompanies();
    const updateCompany = useUpdateCompany();
    const updateBillingCurrency = useUpdateBillingCurrency();
    const { data: plans } = useCompanyPlans();
    const company = myCompanies?.[0];
    const companyId = company?.id;

    const { data: settingsData } = useCompanySettings(companyId ?? 0);

    const [form, setForm] = useState({ name: "", industry: "" });
    const [billingCurrency, setBillingCurrency] = useState("NGN");

    const activePlan = plans?.find(p => p.code?.toLowerCase() === company?.plan?.toLowerCase());

    useEffect(() => {
        if (company) {
            setForm({
                name: company.name ?? "",
                industry: company.industry ?? "",
            });
        }
    }, [company]);

    useEffect(() => {
        if (company) {
            const prefCurrency =
                (settingsData?.settings?.pref_currency?.value as string) ||
                company.billing_currency ||
                "NGN";
            setBillingCurrency(prefCurrency);
        }
    }, [company, settingsData]);

    const hasProfileChanges =
        !!company &&
        (form.name.trim() !== (company.name ?? "") ||
            form.industry !== (company.industry ?? ""));

    const initialBillingCurrency =
        ((settingsData?.settings?.pref_currency?.value as string) ||
            company?.billing_currency ||
            "NGN");
    const hasCurrencyChanges = !!companyId && billingCurrency !== initialBillingCurrency;

    const handleCopyCode = () => {
        if (!company?.company_code) return;
        navigator.clipboard.writeText(company.company_code);
        setCopied(true);
        toast.success("Invite code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        if (!company) return;
        if (!form.name.trim()) {
            toast.error("Company name is required");
            return;
        }
        try {
            await updateCompany.mutateAsync({
                id: company.id,
                data: { name: form.name.trim(), industry: form.industry },
            });
            toast.success("Company profile updated successfully");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update company profile");
        }
    };

    const handleSaveCurrency = async () => {
        if (!companyId) return;
        try {
            await updateBillingCurrency.mutateAsync({ companyId, currency: billingCurrency });
            toast.success("Billing currency updated");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update billing currency");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideLoader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-sm text-muted">Loading company profile...</p>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideBuilding2 className="w-12 h-12 text-muted mb-3" />
                <p className="text-lg font-serif text-heading mb-2">No company found</p>
                <p className="text-sm text-muted">You're not linked to any company yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Company Profile</h1>
                <p className="text-sm text-muted mt-1">Manage your company information and settings</p>
            </div>

            {/* Invite Code Card */}
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-heading mb-1">Company Invite Code</h3>
                        <p className="text-xs text-muted mb-3">
                            Share this code with employees to join your company
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="px-4 py-2 bg-white rounded-lg text-lg font-mono font-semibold text-accent">
                                {company.company_code || "—"}
                            </code>
                            <button
                                onClick={handleCopyCode}
                                className="p-2 rounded-lg bg-white hover:bg-accent/10 transition-colors"
                            >
                                {copied ? (
                                    <LucideCheck className="w-5 h-5 text-accent" />
                                ) : (
                                    <LucideCopy className="w-5 h-5 text-accent" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <LucideBuilding2 className="w-6 h-6 text-accent" />
                    </div>
                </div>
            </div>

            {/* Current Plan Card */}
            <div className={`rounded-2xl border p-6 ${activePlan ? PLAN_STYLES[activePlan.code?.toLowerCase()]?.bg ?? "bg-white" : "bg-white"} ${activePlan ? PLAN_STYLES[activePlan.code?.toLowerCase()]?.border ?? "border-border-light/50" : "border-border-light/50"}`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-heading mb-1">Current Plan</h3>
                        <p className="text-xs text-muted">Your company subscription tier</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${activePlan ? PLAN_STYLES[activePlan.code?.toLowerCase()]?.bg ?? "bg-gray-100" : "bg-gray-100"} ${activePlan ? PLAN_STYLES[activePlan.code?.toLowerCase()]?.text ?? "text-gray-600" : "text-gray-600"}`}>
                        {company?.plan ?? "No plan"}
                    </span>
                </div>
                {activePlan ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted mb-1">Price per credit</p>
                            <p className="text-lg font-serif text-heading">
                                {company.billing_currency === "USD"
                                    ? `$${activePlan.basePriceUsd.toFixed(2)}`
                                    : `₦${activePlan.basePriceNgn.toLocaleString()}`}
                            </p>
                        </div>
                        <div>
                            {activePlan.serviceLevel !== "PREMIUM" && (
                                <>
                                    <p className="text-xs text-muted mb-1">API Access</p>
                                    <p className="text-sm font-semibold">
                                        {activePlan.code === "PREMIUM"
                                            ? <span className="text-green-600">Enabled (Premium)</span>
                                            : <span className="text-muted">Upgrade to Premium</span>}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted">No plan information available. Contact support to set up your plan.</p>
                )}
                {activePlan && activePlan.description && (
                    <p className="text-xs text-muted mt-3 leading-relaxed">{activePlan.description}</p>
                )}
            </div>

            {/* Credit Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Total Credits</p>
                    <p className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">{company.total_credits - company.used_credits}</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Used Credits</p>
                    <p className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">{company.used_credits}</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Employees</p>
                    <p className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">{company.employee_count}</p>
                </div>
            </div>

            {/* Company Details Form */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-base font-semibold text-heading mb-6">Company Details</h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-button-secondary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Industry
                        </label>
                        <select
                            value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            className="w-full bg-button-secondary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
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
                            value={activePlan?.displayName ?? company.plan ?? "No plan"}
                            readOnly
                            className="w-full bg-button-secondary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none"
                        />
                        <p className="text-xs text-muted mt-1.5">Plan changes are managed by billing or sales and are not editable here.</p>
                    </div>

                </div>

                <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={updateCompany.isPending || !hasProfileChanges}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 disabled:opacity-50"
                    >
                        {updateCompany.isPending ? (
                            <><LucideLoader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                            <><LucideSave className="w-4 h-4" /> Save Changes</>
                        )}
                    </button>
                </div>
            </div>

            {/* Billing Currency */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-base font-semibold text-heading mb-1">Billing Currency</h2>
                <p className="text-xs text-muted mb-6">
                    Sets the currency shown on all credit purchase cards for this company.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Currency
                        </label>
                        <select
                            value={billingCurrency}
                            onChange={(e) => setBillingCurrency(e.target.value)}
                            className="w-full bg-button-secondary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        >
                            {BILLING_CURRENCIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSaveCurrency}
                        disabled={updateBillingCurrency.isPending || !hasCurrencyChanges}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 disabled:opacity-50 shrink-0"
                    >
                        {updateBillingCurrency.isPending ? (
                            <><LucideLoader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                            <><LucideSave className="w-4 h-4" /> Save Currency</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
