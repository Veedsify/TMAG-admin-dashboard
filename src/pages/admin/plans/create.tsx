import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LucideArrowLeft, LucideUser, LucideMapPin, LucideLoader2, LucideCoins, LucideCheck } from "lucide-react";
import toast from "react-hot-toast";
import { usePlanStore } from "../../../stores/planStore";

const purposes = ["Business", "Conference", "Client Visit", "Training", "Leisure", "Other"];
const durations = ["1-3 days", "4-7 days", "8-14 days", "15-30 days", "30+ days"];

const CreatePlan = () => {
    const navigate = useNavigate();
    const employees = usePlanStore((s) => s.employees);
    const addPlan = usePlanStore((s) => s.addPlan);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        employeeId: "",
        destination: "",
        country: "",
        duration: "",
        purpose: "",
        medicalNotes: "",
    });

    const selectedEmployee = employees.find((e) => e.id === form.employeeId);
    const creditsRemaining = 84;

    const handleSubmit = async () => {
        if (!form.employeeId || !form.destination || !form.country || !form.duration || !form.purpose) {
            toast.error("Please fill in all required fields");
            return;
        }
        setSubmitting(true);
        await new Promise((r) => setTimeout(r, 2000));
        addPlan({
            id: `p${Date.now()}`,
            companyId: "c1",
            destination: form.destination,
            country: form.country,
            duration: form.duration,
            purpose: form.purpose,
            riskScore: "Moderate",
            status: "processing",
            createdAt: new Date().toISOString().split("T")[0],
            employeeId: form.employeeId,
            employeeName: selectedEmployee?.name,
            vaccinations: [],
            healthAlerts: [],
            safetyAdvisories: [],
            medications: [],
            waterFood: [],
            emergencyContacts: [],
        });
        toast.success("Travel plan created successfully");
        navigate("/admin/plans");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/admin/plans" className="p-2 rounded-xl hover:bg-white transition-colors">
                    <LucideArrowLeft className="w-5 h-5 text-muted" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">Create Travel Plan</h1>
                    <p className="text-sm text-muted mt-0.5">Generate a personalized health advisory for an employee</p>
                </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-border-light/50 w-fit">
                {[1, 2].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStep(s)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            step === s ? "bg-accent text-white" : "text-muted hover:bg-background-primary"
                        }`}
                    >
                        <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${
                            step > s ? "bg-white/20" : step === s ? "bg-white/20" : "bg-button-secondary"
                        }`}>
                            {step > s ? <LucideCheck className="w-3 h-3" /> : s}
                        </span>
                        {s === 1 ? "Details" : "Review"}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-xl border border-accent/20">
                    <LucideCoins className="w-5 h-5 text-accent" />
                    <span className="text-sm text-heading">
                        <span className="font-semibold">{creditsRemaining}</span> credits remaining &mdash; this plan uses <span className="font-semibold">1 credit</span>
                    </span>
                </div>

                {step === 1 && (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Select Employee <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.employeeId}
                                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                            >
                                <option value="">Choose an employee...</option>
                                {employees.map((e) => (
                                    <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                                ))}
                            </select>
                            {selectedEmployee && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                                    <LucideUser className="w-3.5 h-3.5" />
                                    {selectedEmployee.department} &middot; {selectedEmployee.creditsAllocated - selectedEmployee.creditsUsed} credits available
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Destination City <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LucideMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="text"
                                    value={form.destination}
                                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                                    placeholder="e.g. Singapore"
                                    className="w-full pl-9 pr-4 py-3 bg-background-primary border border-border-light rounded-xl text-sm text-heading outline-none focus:border-accent transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.country}
                                onChange={(e) => setForm({ ...form, country: e.target.value })}
                                placeholder="e.g. Singapore"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Duration <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.duration}
                                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                    className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                                >
                                    <option value="">Select...</option>
                                    {durations.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                    Purpose <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.purpose}
                                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                                    className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                                >
                                    <option value="">Select...</option>
                                    {purposes.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Medical Notes <span className="text-muted font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={form.medicalNotes}
                                onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
                                placeholder="Any relevant health conditions, allergies, or special requirements..."
                                rows={3}
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors resize-none"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!form.employeeId || !form.destination || !form.country || !form.duration || !form.purpose}
                                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Review
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="rounded-xl bg-background-primary p-5 space-y-3">
                            <h3 className="text-sm font-semibold text-heading mb-3">Plan Summary</h3>
                            {[
                                { label: "Employee", value: selectedEmployee?.name },
                                { label: "Destination", value: `${form.destination}, ${form.country}` },
                                { label: "Duration", value: form.duration },
                                { label: "Purpose", value: form.purpose },
                                form.medicalNotes && { label: "Medical Notes", value: form.medicalNotes },
                            ].filter(Boolean).map((item: any) => (
                                <div key={item.label} className="flex items-start gap-3">
                                    <span className="text-xs font-semibold text-muted w-28 flex-shrink-0">{item.label}</span>
                                    <span className="text-sm text-heading">{item.value || "—"}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-background-primary rounded-xl">
                            <div className="flex-1 text-sm text-heading">
                                <span className="font-semibold">1 credit</span> will be deducted from your balance
                            </div>
                            <div className="text-sm text-muted">
                                {creditsRemaining} → {creditsRemaining - 1} remaining
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-70"
                            >
                                {submitting ? (
                                    <><LucideLoader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                ) : (
                                    <>Generate Travel Plan</>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatePlan;
