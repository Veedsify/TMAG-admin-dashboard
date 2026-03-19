import { useState } from "react";
import { LucideSave, LucideBuilding2, LucideBell, LucideShield, LucideGlobe } from "lucide-react";
import toast from "react-hot-toast";

const tabs = [
    { id: "general", label: "General", icon: LucideBuilding2 },
    { id: "notifications", label: "Notifications", icon: LucideBell },
    { id: "security", label: "Security", icon: LucideShield },
    { id: "preferences", label: "Preferences", icon: LucideGlobe },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState("general");
    const [general, setGeneral] = useState({
        name: "TechCorp Global",
        industry: "Technology",
        email: "admin@techcorp.com",
        phone: "+1 234 567 8900",
        address: "123 Business St, San Francisco, CA 94105",
        website: "https://techcorp.com",
        timezone: "America/Los_Angeles",
    });
    const [notifications, setNotifications] = useState({
        travelRequests: true,
        planCompletion: true,
        billingAlerts: true,
        teamActivity: false,
        weeklyDigest: true,
    });
    const [twoFactor, setTwoFactor] = useState(false);

    const handleSave = () => {
        toast.success("Settings saved successfully");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">Settings</h1>
                <p className="text-sm text-muted">Manage your company and admin preferences</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                                ? "bg-accent text-white"
                                : "bg-white border border-border-light/50 text-muted hover:bg-background-primary"
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "general" && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                    <h2 className="text-base font-semibold text-heading">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company Name</label>
                            <input type="text" value={general.name} onChange={(e) => setGeneral({ ...general, name: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Industry</label>
                            <select value={general.industry} onChange={(e) => setGeneral({ ...general, industry: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors">
                                {["Technology", "Healthcare", "Finance", "Manufacturing", "Consulting", "Other"].map((i) => <option key={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email</label>
                            <input type="email" value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Phone</label>
                            <input type="tel" value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Website</label>
                            <input type="url" value={general.website} onChange={(e) => setGeneral({ ...general, website: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Timezone</label>
                            <select value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors">
                                {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Africa/Lagos", "Asia/Dubai"].map((tz) => <option key={tz}>{tz}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Address</label>
                            <textarea value={general.address} onChange={(e) => setGeneral({ ...general, address: e.target.value })} rows={2} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">
                            <LucideSave className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                    <h2 className="text-base font-semibold text-heading">Notification Preferences</h2>
                    <div className="space-y-4">
                        {[
                            { key: "travelRequests", label: "New travel requests", desc: "Get notified when an employee submits a travel request" },
                            { key: "planCompletion", label: "Plan completion", desc: "Get notified when a travel plan has been generated" },
                            { key: "billingAlerts", label: "Billing alerts", desc: "Credit low balance and payment reminders" },
                            { key: "teamActivity", label: "Team activity", desc: "Invite acceptances and onboarding completions" },
                            { key: "weeklyDigest", label: "Weekly digest", desc: "Summary of activity sent every Monday" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-border-light/30 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-heading">{item.label}</p>
                                    <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? "bg-accent" : "bg-border"}`}
                                >
                                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">
                            <LucideSave className="w-4 h-4" />
                            Save Preferences
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "security" && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                        <h2 className="text-base font-semibold text-heading">Password</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">New Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                            </div>
                        </div>
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">
                            <LucideSave className="w-4 h-4" />
                            Update Password
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-heading">Two-Factor Authentication</h2>
                                <p className="text-xs text-muted mt-0.5">Add an extra layer of security to your account</p>
                            </div>
                            <button
                                onClick={() => setTwoFactor(!twoFactor)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${twoFactor ? "bg-accent" : "bg-border"}`}
                            >
                                <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${twoFactor ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                        </div>
                        {twoFactor && (
                            <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                                <p className="text-sm text-heading font-medium mb-2">Two-factor authentication is enabled</p>
                                <p className="text-xs text-muted">Your account is protected with an additional security layer.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "preferences" && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                    <h2 className="text-base font-semibold text-heading">Display Preferences</h2>
                    <div className="space-y-4">
                        {[
                            { label: "Date Format", options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] },
                            { label: "Distance Units", options: ["Miles", "Kilometers"] },
                            { label: "Temperature Units", options: ["Fahrenheit (°F)", "Celsius (°C)"] },
                            { label: "Currency", options: ["USD ($)", "EUR (€)", "GBP (£)", "NGN (₦)"] },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-3 border-b border-border-light/30 last:border-0">
                                <span className="text-sm font-medium text-heading">{item.label}</span>
                                <select className="bg-background-primary border border-border-light rounded-xl px-3 py-2 text-sm text-heading outline-none focus:border-accent transition-colors">
                                    {item.options.map((o) => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">
                            <LucideSave className="w-4 h-4" />
                            Save Preferences
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-base font-semibold text-heading mb-3">Danger Zone</h2>
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                    <div>
                        <p className="text-sm font-semibold text-red-700">Delete Account</p>
                        <p className="text-xs text-red-500 mt-0.5">Permanently delete your company account and all data</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
