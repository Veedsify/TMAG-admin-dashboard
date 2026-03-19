import { LucideDownload, LucideFileText, LucideUsers, LucideMapPin, LucideActivity } from "lucide-react";
import toast from "react-hot-toast";

const reports = [
    {
        id: "usage",
        title: "Usage Report",
        description: "Credit consumption, plans generated, and employee activity across all team members",
        icon: LucideActivity,
        format: ["CSV", "PDF"],
    },
    {
        id: "plans",
        title: "Plan History",
        description: "All generated travel plans with destinations, risk scores, vaccination details, and dates",
        icon: LucideMapPin,
        format: ["CSV", "PDF"],
    },
    {
        id: "compliance",
        title: "Compliance Report",
        description: "Duty-of-care audit trail with timestamps, approved requests, and completed questionnaires",
        icon: LucideFileText,
        format: ["PDF"],
    },
    {
        id: "team",
        title: "Team Report",
        description: "Employee overview with onboarding status, role assignments, and credit allocation",
        icon: LucideUsers,
        format: ["CSV", "PDF"],
    },
];

const Reports = () => {
    const stats = [
        { label: "Total Plans", value: "47", icon: LucideMapPin },
        { label: "Total Employees", value: "24", icon: LucideUsers },
        { label: "Completed Trips", value: "31", icon: LucideFileText },
        { label: "Credits Used", value: "186", icon: LucideActivity },
    ];

    const handleDownload = (id: string, format: string) => {
        toast.success(`Generating ${id} report as ${format}...`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">Reports & Analytics</h1>
                <p className="text-sm text-muted">Generate and export company reports for compliance and oversight</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-border-light/50 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">{stat.label}</span>
                            <stat.icon className="w-4 h-4 text-muted" />
                        </div>
                        <p className="text-3xl font-serif text-heading">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-base font-semibold text-heading mb-4">Available Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-2xl border border-border-light/50 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <report.icon className="w-5 h-5 text-accent" />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-heading mb-1.5">{report.title}</h3>
                            <p className="text-sm text-muted leading-relaxed mb-4">{report.description}</p>
                            <div className="flex gap-2">
                                {report.format.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => handleDownload(report.id, f)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-button-secondary text-heading font-semibold text-xs hover:bg-border-light transition-colors"
                                    >
                                        <LucideDownload className="w-3.5 h-3.5" />
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-base font-semibold text-heading mb-4">Scheduled Reports</h2>
                <div className="space-y-3">
                    {[
                        { name: "Monthly Usage Summary", frequency: "Monthly", nextRun: "Apr 1, 2026", active: true },
                        { name: "Quarterly Compliance Report", frequency: "Quarterly", nextRun: "Apr 1, 2026", active: false },
                    ].map((sr, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background-primary">
                            <div>
                                <p className="text-sm font-medium text-heading">{sr.name}</p>
                                <p className="text-xs text-muted mt-0.5">{sr.frequency} &middot; Next run: {sr.nextRun}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${sr.active ? "bg-accent" : "bg-muted"}`} />
                                <span className="text-xs font-semibold text-muted">{sr.active ? "Active" : "Paused"}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
