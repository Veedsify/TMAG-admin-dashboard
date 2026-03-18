import { useState } from "react";
import { LucideBuilding2, LucideSave, LucideCopy, LucideCheck } from "lucide-react";
import toast from "react-hot-toast";

const CompanyProfile = () => {
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({
        name: "TechCorp Global",
        industry: "Technology",
        email: "admin@techcorp.com",
        phone: "+1 234 567 8900",
        address: "123 Business St, San Francisco, CA 94105",
        billingCurrency: "USD",
        inviteCode: "TMA-TC001",
    });

    const handleCopyCode = () => {
        navigator.clipboard.writeText(form.inviteCode);
        setCopied(true);
        toast.success("Invite code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        toast.success("Company profile updated successfully");
    };

    return (
        <div className="max-w-4xl space-y-6">
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
                                {form.inviteCode}
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
                            <option>Technology</option>
                            <option>Healthcare</option>
                            <option>Finance</option>
                            <option>Manufacturing</option>
                            <option>Consulting</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Address
                        </label>
                        <textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            rows={3}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            Billing Currency
                        </label>
                        <select
                            value={form.billingCurrency}
                            onChange={(e) => setForm({ ...form, billingCurrency: e.target.value })}
                            className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="NGN">NGN - Nigerian Naira</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                    >
                        <LucideSave className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
