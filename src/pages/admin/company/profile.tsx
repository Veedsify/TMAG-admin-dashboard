import { useState, useEffect } from "react";
import { LucideBuilding2, LucideSave, LucideCopy, LucideCheck, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useUpdateCompany, useCompanySettings, useUpdateBillingCurrency } from "../../../api/hooks";

const BILLING_CURRENCIES = [
    { value: "NGN", label: "NGN — Nigerian Naira (₦)" },
    { value: "USD", label: "USD — US Dollar ($)" },
    { value: "EUR", label: "EUR — Euro (€)" },
    { value: "GBP", label: "GBP — British Pound (£)" },
];

const CompanyProfile = () => {
    const [copied, setCopied] = useState(false);
    const { data: myCompanies, isLoading } = useMyCompanies();
    const updateCompany = useUpdateCompany();
    const updateBillingCurrency = useUpdateBillingCurrency();
    const company = myCompanies?.[0];
    const companyId = company?.id;

    const { data: settingsData } = useCompanySettings(companyId!);

    const [form, setForm] = useState({ name: "", industry: "", plan: "" });
    const [billingCurrency, setBillingCurrency] = useState("NGN");

    useEffect(() => {
        if (company) {
            setForm({
                name: company.name ?? "",
                industry: company.industry ?? "",
                plan: company.plan ?? "",
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

    const handleCopyCode = () => {
        if (!company?.company_code) return;
        navigator.clipboard.writeText(company.company_code);
        setCopied(true);
        toast.success("Invite code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        if (!company) return;
        try {
            await updateCompany.mutateAsync({
                id: company.id,
                data: { name: form.name, industry: form.industry, plan: form.plan },
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
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">Company Profile</h1>
                <p className="text-sm text-muted">Manage your company information and settings</p>
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

            {/* Credit Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Total Credits</p>
                    <p className="text-2xl font-serif font-bold text-heading">{company.total_credits - company.used_credits}</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Used Credits</p>
                    <p className="text-2xl font-serif font-bold text-heading">{company.used_credits}</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Employees</p>
                    <p className="text-2xl font-serif font-bold text-heading">{company.employee_count}</p>
                </div>
            </div>

            {/* Company Details Form */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-lg font-semibold text-heading mb-6">Company Details</h2>
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Industry
                        </label>
                        <select
                            value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
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
                            value={form.plan}
                            onChange={(e) => setForm({ ...form, plan: e.target.value })}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>

                </div>

                <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={updateCompany.isPending}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
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
                <h2 className="text-lg font-semibold text-heading mb-1">Billing Currency</h2>
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
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        >
                            {BILLING_CURRENCIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSaveCurrency}
                        disabled={updateBillingCurrency.isPending}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
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
