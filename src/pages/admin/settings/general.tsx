import { useState, useEffect } from "react";
import { LucideSave, LucideBuilding2, LucideBell, LucideShield, LucideGlobe, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useUpdateCompany, useUpdateProfilePassword, useCompanySettings, useUpdateCompanySettings } from "../../../api/hooks";

const tabs = [
    { id: "general", label: "General", icon: LucideBuilding2 },
    { id: "notifications", label: "Notifications", icon: LucideBell },
    { id: "security", label: "Security", icon: LucideShield },
    { id: "preferences", label: "Preferences", icon: LucideGlobe },
];

const preferenceOptions: Record<string, string[]> = {
    dateFormat: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
    distanceUnit: ["Miles", "Kilometers"],
    temperatureUnit: ["Fahrenheit (°F)", "Celsius (°C)"],
    currency: ["USD ($)", "EUR (€)", "GBP (£)", "NGN (₦)"],
};

const settingKeyMap = {
    travelRequests: "notify_travel_requests",
    planCompletion: "notify_plan_completion",
    billingAlerts: "notify_billing_alerts",
    teamActivity: "notify_team_activity",
    weeklyDigest: "notify_weekly_digest",
    twoFactor: "two_factor_enabled",
    dateFormat: "pref_date_format",
    distanceUnit: "pref_distance_unit",
    temperatureUnit: "pref_temperature_unit",
    currency: "pref_currency",
} as const;

const Settings = () => {
    const [activeTab, setActiveTab] = useState("general");
    const { data: myCompanies, isLoading: companyLoading } = useMyCompanies();
    const updateCompany = useUpdateCompany();
    const updatePassword = useUpdateProfilePassword();
    const updateSettings = useUpdateCompanySettings();
    const company = myCompanies?.[0];
    const companyId = company?.id;

    const { data: settingsData } = useCompanySettings(companyId!);

    const [general, setGeneral] = useState({
        name: "",
        industry: "",
        plan: "",
    });
    const [notifications, setNotifications] = useState({
        travelRequests: true,
        planCompletion: true,
        billingAlerts: true,
        teamActivity: false,
        weeklyDigest: true,
    });
    const [twoFactor, setTwoFactor] = useState(false);
    const [preferences, setPreferences] = useState({
        dateFormat: "MM/DD/YYYY",
        distanceUnit: "Miles",
        temperatureUnit: "Fahrenheit (°F)",
        currency: "USD ($)",
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (company) {
            setGeneral({
                name: company.name ?? "",
                industry: company.industry ?? "",
                plan: company.plan ?? "",
            });
        }
    }, [company]);

    useEffect(() => {
        if (settingsData?.settings) {
            const s = settingsData.settings;
            setNotifications({
                travelRequests: s[settingKeyMap.travelRequests]?.value === true,
                planCompletion: s[settingKeyMap.planCompletion]?.value === true,
                billingAlerts: s[settingKeyMap.billingAlerts]?.value === true,
                teamActivity: s[settingKeyMap.teamActivity]?.value === true,
                weeklyDigest: s[settingKeyMap.weeklyDigest]?.value === true,
            });
            setTwoFactor(s[settingKeyMap.twoFactor]?.value === true);
            setPreferences({
                dateFormat: (s[settingKeyMap.dateFormat]?.value as string) || "MM/DD/YYYY",
                distanceUnit: (s[settingKeyMap.distanceUnit]?.value as string) || "Miles",
                temperatureUnit: (s[settingKeyMap.temperatureUnit]?.value as string) || "Fahrenheit (°F)",
                currency: (s[settingKeyMap.currency]?.value as string) || "USD ($)",
            });
        }
    }, [settingsData]);

    const handleSaveGeneral = async () => {
        if (!company) return;
        try {
            await updateCompany.mutateAsync({
                id: company.id,
                data: {
                    name: general.name,
                    industry: general.industry,
                    plan: general.plan,
                },
            });
            toast.success("Company settings saved successfully");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to save settings");
        }
    };

    const handleSaveNotifications = async () => {
        if (!companyId) return;
        const settings: Record<string, { value: string; type: string }> = {};
        for (const [uiKey, backendKey] of Object.entries(settingKeyMap)) {
            if (uiKey in notifications) {
                settings[backendKey] = { value: String(notifications[uiKey as keyof typeof notifications]), type: "BOOLEAN" };
            }
        }
        try {
            await updateSettings.mutateAsync({ companyId, settings });
            toast.success("Notification preferences saved");
        } catch {
            toast.error("Failed to save notification preferences");
        }
    };

    const handleSavePreferences = async () => {
        if (!companyId) return;
        const settings: Record<string, { value: string; type: string }> = {};
        for (const [uiKey, backendKey] of Object.entries(settingKeyMap)) {
            if (uiKey in preferences) {
                settings[backendKey] = { value: preferences[uiKey as keyof typeof preferences], type: "STRING" };
            }
        }
        try {
            await updateSettings.mutateAsync({ companyId, settings });
            toast.success("Preferences saved");
        } catch {
            toast.error("Failed to save preferences");
        }
    };

    const handleToggleTwoFactor = async () => {
        if (!companyId) return;
        const newValue = !twoFactor;
        setTwoFactor(newValue);
        try {
            await updateSettings.mutateAsync({
                companyId,
                settings: { [settingKeyMap.twoFactor]: { value: String(newValue), type: "BOOLEAN" } },
            });
            toast.success(newValue ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
        } catch {
            setTwoFactor(!newValue);
            toast.error("Failed to update two-factor setting");
        }
    };

    const handleUpdatePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error("Please fill in all password fields");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        try {
            await updatePassword.mutateAsync({
                OldPassword: passwordForm.currentPassword,
                NewPassword: passwordForm.newPassword,
            });
            toast.success("Password updated successfully");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update password");
        }
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
                    {companyLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company Name</label>
                                    <input type="text" value={general.name} onChange={(e) => setGeneral({ ...general, name: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Industry</label>
                                    <select value={general.industry} onChange={(e) => setGeneral({ ...general, industry: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors">
                                        <option value="">Select industry...</option>
                                        {["Technology", "Healthcare", "Finance", "Manufacturing", "Consulting", "Other"].map((i) => <option key={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Plan</label>
                                    <input type="text" value={general.plan} onChange={(e) => setGeneral({ ...general, plan: e.target.value })} className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Invite Code</label>
                                    <input type="text" value={company?.company_code ?? ""} readOnly className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none cursor-default" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button onClick={handleSaveGeneral} disabled={updateCompany.isPending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                                    {updateCompany.isPending ? <><LucideLoader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><LucideSave className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </div>
                        </>
                    )}
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
                        <button onClick={handleSaveNotifications} disabled={updateSettings.isPending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                            {updateSettings.isPending ? <><LucideLoader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><LucideSave className="w-4 h-4" /> Save Preferences</>}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "security" && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                        <h2 className="text-base font-semibold text-heading">Password</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                                />
                            </div>
                        </div>
                        <button onClick={handleUpdatePassword} disabled={updatePassword.isPending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                            {updatePassword.isPending ? <><LucideLoader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><LucideSave className="w-4 h-4" /> Update Password</>}
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-heading">Two-Factor Authentication</h2>
                                <p className="text-xs text-muted mt-0.5">Add an extra layer of security to your account</p>
                            </div>
                            <button
                                onClick={handleToggleTwoFactor}
                                disabled={updateSettings.isPending}
                                className={`w-11 h-6 rounded-full transition-colors relative ${twoFactor ? "bg-accent" : "bg-border"} disabled:opacity-50`}
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
                            { label: "Date Format", key: "dateFormat", options: preferenceOptions.dateFormat },
                            { label: "Distance Units", key: "distanceUnit", options: preferenceOptions.distanceUnit },
                            { label: "Temperature Units", key: "temperatureUnit", options: preferenceOptions.temperatureUnit },
                            { label: "Currency", key: "currency", options: preferenceOptions.currency },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-border-light/30 last:border-0">
                                <span className="text-sm font-medium text-heading">{item.label}</span>
                                <select
                                    value={preferences[item.key as keyof typeof preferences]}
                                    onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.value })}
                                    className="bg-background-primary border border-border-light rounded-xl px-3 py-2 text-sm text-heading outline-none focus:border-accent transition-colors"
                                >
                                    {item.options.map((o) => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={handleSavePreferences} disabled={updateSettings.isPending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                            {updateSettings.isPending ? <><LucideLoader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><LucideSave className="w-4 h-4" /> Save Preferences</>}
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
                    <button
                        onClick={() => {
                            if (company && window.confirm("Are you sure you want to delete your company? This action cannot be undone.")) {
                                toast.error("Company deletion requires contacting support");
                            }
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
