import { useState } from "react";
import { LucideDownload, LucideFileText, LucideUsers, LucideMapPin, LucideActivity, LucideLoader2 } from "lucide-react";
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

const Reports = () => {
    const { data: myCompanies } = useMyCompanies();
    const company = myCompanies?.[0];
    const companyId = company?.id;

    const { data: usageReport, isLoading: usageLoading } = useUsageReport(companyId);
    const { data: planHistory, isLoading: plansLoading } = usePlanHistoryReport(companyId);
    useTeamReport(companyId);

    const [exporting, setExporting] = useState<string | null>(null);

    const isLoading = usageLoading || plansLoading;

    const totalPlans = usageReport?.totalPlansGenerated ?? 0;
    const totalEmployees = usageReport?.totalEmployees ?? 0;
    const completedTrips = planHistory?.filter((p) => p.status === "COMPLETED").length ?? 0;
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

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Reports & Analytics</h1>
                <p className="text-sm text-muted mt-1">Generate and export company reports for compliance and oversight</p>
            </div>

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

            {/* Top Destinations from real data */}
            {planHistory && planHistory.length > 0 && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                    <h2 className="text-base font-semibold text-heading mb-4">Top Destinations</h2>
                    <div className="space-y-3">
                        {Object.entries(planHistory.reduce<Record<string, number>>((acc, p) => {
                            acc[p.destination] = (acc[p.destination] || 0) + 1;
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