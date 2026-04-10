import { useState } from "react";
import { LucideDownload, LucideFileText, LucideUsers, LucideMapPin, LucideActivity, LucideLoader2, LucideAlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useUsageReport, usePlanHistoryReport, useTeamReport } from "../../../api/hooks";
import { adminReportsApi } from "../../../api/api";

function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-xs text-muted">—</span>;
    const s = status.toUpperCase();
    const cls =
        s === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : s === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : s === "PROCESSING" || s === "QUEUED" || s === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200"
        : s === "FAILED" || s === "ERROR" ? "bg-red-50 text-red-700 border-red-200"
        : s === "INACTIVE" ? "bg-gray-50 text-gray-500 border-gray-200"
        : "bg-gray-50 text-gray-600 border-gray-200";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${cls}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
    );
}

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-border-light rounded animate-pulse" style={{ width: i === 0 ? "80%" : "60%" }} />
                </td>
            ))}
        </tr>
    );
}

const Reports = () => {
    const { data: myCompanies } = useMyCompanies();
    const company = myCompanies?.[0];
    const companyId = company?.id;

    const { data: usageReport, isLoading: usageLoading } = useUsageReport(companyId);
    const { data: planHistory, isLoading: plansLoading } = usePlanHistoryReport(companyId);
    const { data: teamReport, isLoading: teamLoading } = useTeamReport(companyId);

    const [exporting, setExporting] = useState<string | null>(null);

    const isLoading = usageLoading || plansLoading;

    const totalPlans = usageReport?.totalPlansGenerated ?? 0;
    const totalEmployees = usageReport?.totalEmployees ?? 0;
    const completedTrips = planHistory?.filter((p) => p.status?.toUpperCase() === "COMPLETED").length ?? 0;
    const creditsUsed = usageReport?.totalCreditsUsed ?? 0;

    const stats = [
        { label: "Total Plans", value: totalPlans, icon: LucideMapPin },
        { label: "Total Employees", value: totalEmployees, icon: LucideUsers },
        { label: "Completed Trips", value: completedTrips, icon: LucideFileText },
        { label: "Credits Used", value: creditsUsed, icon: LucideActivity },
    ];

    const handleExport = async (id: string, format: string) => {
        if (format !== "CSV") {
            window.print();
            toast.success(`Print ${id} report as PDF`);
            return;
        }

        setExporting(id);
        try {
            let response: { data: string } | undefined;
            let filename = "";

            switch (id) {
                case "usage":
                    response = await adminReportsApi.getUsageReportCsv(companyId);
                    filename = "usage-report.csv";
                    break;
                case "plans":
                    response = await adminReportsApi.getPlanHistoryCsv(companyId);
                    filename = "plan-history.csv";
                    break;
                case "team":
                    response = await adminReportsApi.getTeamReportCsv(companyId);
                    filename = "team-report.csv";
                    break;
            }

            if (response?.data) {
                downloadCSV(response.data, filename);
                toast.success(`${id} report downloaded as CSV`);
            }
        } catch (error) {
            console.error("Export failed:", error);
            toast.error(`Failed to export ${id} report`);
        } finally {
            setExporting(null);
        }
    };

    const reports = [
        { id: "usage", title: "Usage Report", description: "Credit consumption, plans generated, and employee activity across all team members", icon: LucideActivity, format: ["CSV"] },
        { id: "plans", title: "Plan History", description: "All generated travel plans with destinations, risk scores, vaccination details, and dates", icon: LucideMapPin, format: ["CSV"] },
        { id: "team", title: "Team Report", description: "Employee overview with onboarding status, role assignments, and credit allocation", icon: LucideUsers, format: ["CSV"] },
    ];

    const employees = usageReport?.employees ?? teamReport?.employees ?? [];

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Reports & Analytics</h1>
                <p className="text-sm text-muted mt-1">Generate and export company reports for compliance and oversight</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-border-light/50 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">{stat.label}</span>
                            {isLoading ? (
                                <LucideLoader2 className="w-4 h-4 text-muted animate-spin" />
                            ) : (
                                <stat.icon className="w-4 h-4 text-muted" />
                            )}
                        </div>
                        <p className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">{isLoading ? "—" : stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Report download cards */}
            <div>
                <h2 className="text-base font-semibold text-heading mb-4">Available Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        onClick={() => handleExport(report.id, f)}
                                        disabled={exporting === report.id}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-button-secondary text-heading font-semibold text-xs hover:bg-border-light transition-colors disabled:opacity-50"
                                    >
                                        {exporting === report.id ? (
                                            <LucideLoader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <LucideDownload className="w-3.5 h-3.5" />
                                        )}
                                        {exporting === report.id ? "Exporting..." : f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Employee activity table */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-base font-semibold text-heading">Employee Activity</h2>
                    <p className="text-xs text-muted mt-0.5">Credit usage and plan generation per team member</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border-light/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Department</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Credits Used</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Allocated</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Plans</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/30">
                            {usageLoading || teamLoading ? (
                                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted">
                                            <LucideAlertCircle className="w-5 h-5" />
                                            <span className="text-sm">No employee activity data yet</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp, i) => (
                                    <tr key={i} className="hover:bg-background-primary/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-heading text-sm">{emp.employeeName ?? "—"}</p>
                                                <p className="text-xs text-muted">{emp.employeeEmail ?? ""}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-body">{emp.department ?? "—"}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-heading tabular-nums">{emp.creditsUsed ?? 0}</td>
                                        <td className="px-4 py-3 text-right text-muted tabular-nums">{emp.creditsAllocated ?? 0}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-heading tabular-nums">{emp.plansGenerated ?? 0}</td>
                                        <td className="px-4 py-3"><StatusBadge status={emp.status ?? null} /></td>
                                        <td className="px-4 py-3 text-xs text-muted">
                                            {emp.lastActivityAt ? new Date(emp.lastActivityAt).toLocaleDateString() : "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Plan history table */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-base font-semibold text-heading">Plan History</h2>
                    <p className="text-xs text-muted mt-0.5">All travel plans generated by your team</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border-light/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Destination</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Country</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Purpose</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Days</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Risk</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Employee</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/30">
                            {plansLoading ? (
                                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
                            ) : !planHistory || planHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted">
                                            <LucideMapPin className="w-5 h-5" />
                                            <span className="text-sm">No travel plans generated yet</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                planHistory.map((plan) => (
                                    <tr key={plan.planId} className="hover:bg-background-primary/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-heading">{plan.destination ?? "—"}</td>
                                        <td className="px-4 py-3 text-body">{plan.country ?? "—"}</td>
                                        <td className="px-4 py-3 text-body">{plan.purpose ?? "—"}</td>
                                        <td className="px-4 py-3 text-right tabular-nums text-body">{plan.duration ?? "—"}</td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            <span className={`font-semibold ${(plan.riskScore ?? 0) >= 7 ? "text-red-600" : (plan.riskScore ?? 0) >= 4 ? "text-amber-600" : "text-emerald-600"}`}>
                                                {plan.riskScore ?? "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge status={plan.status ?? null} /></td>
                                        <td className="px-4 py-3 text-sm text-body">{plan.employeeName ?? "—"}</td>
                                        <td className="px-4 py-3 text-xs text-muted">
                                            {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Destinations */}
            {planHistory && planHistory.length > 0 && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                    <h2 className="text-base font-semibold text-heading mb-4">Top Destinations</h2>
                    <div className="space-y-3">
                        {Object.entries(planHistory.reduce<Record<string, number>>((acc, p) => {
                            if (p.destination) acc[p.destination] = (acc[p.destination] || 0) + 1;
                            return acc;
                        }, {}))
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([dest, count]) => (
                                <div key={dest} className="flex items-center justify-between p-3 rounded-xl bg-background-primary">
                                    <div className="flex items-center gap-3">
                                        <LucideMapPin className="w-4 h-4 text-accent" />
                                        <span className="text-sm font-medium text-heading">{dest}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-accent">{count} plan{count > 1 ? "s" : ""}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
