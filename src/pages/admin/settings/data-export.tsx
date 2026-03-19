import { useState } from "react";
import { Link } from "react-router-dom";
import { LucideArrowLeft, LucideDownload, LucideFileText, LucideUsers, LucideMapPin, LucideActivity, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";

const dataTypes = [
    { id: "employees", label: "Employee Data", desc: "Names, emails, departments, roles, and credit allocations", icon: LucideUsers },
    { id: "plans", label: "Travel Plans", desc: "All generated travel health plans with recommendations", icon: LucideMapPin },
    { id: "requests", label: "Travel Requests", desc: "All travel requests and their approval status", icon: LucideActivity },
    { id: "billing", label: "Billing History", desc: "Invoices, credit purchases, and transactions", icon: LucideFileText },
    { id: "questionnaires", label: "Health Questionnaires", desc: "Employee health profiles and questionnaire responses", icon: LucideActivity },
];

const DataExport = () => {
    const [selected, setSelected] = useState<string[]>(["employees", "plans"]);
    const [format, setFormat] = useState<"json" | "csv" | "pdf">("json");
    const [exporting, setExporting] = useState(false);

    const toggle = (id: string) => {
        setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
    };

    const handleExport = async () => {
        if (selected.length === 0) {
            toast.error("Please select at least one data type to export");
            return;
        }
        setExporting(true);
        await new Promise((r) => setTimeout(r, 2500));
        setExporting(false);
        toast.success(`Export completed: ${selected.join(", ")} as ${format.toUpperCase()}`);
    };

    const selectAll = () => setSelected(dataTypes.map((d) => d.id));
    const selectNone = () => setSelected([]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/admin/settings" className="p-2 rounded-xl hover:bg-white transition-colors">
                    <LucideArrowLeft className="w-5 h-5 text-muted" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">Data Export</h1>
                    <p className="text-sm text-muted mt-0.5">Export all company data for compliance or offboarding</p>
                </div>
            </div>

            <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5 flex items-start gap-3">
                <LucideDownload className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-heading mb-0.5">GDPR Compliance</p>
                    <p className="text-xs text-muted">You have the right to export all personal and company data. Exports are provided in machine-readable formats within 72 hours of request.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-heading">Select Data to Export</h2>
                    <div className="flex gap-2">
                        <button onClick={selectAll} className="text-xs text-accent font-medium hover:underline">Select All</button>
                        <span className="text-muted">&middot;</span>
                        <button onClick={selectNone} className="text-xs text-accent font-medium hover:underline">Clear</button>
                    </div>
                </div>

                <div className="space-y-3">
                    {dataTypes.map((dt) => (
                        <label
                            key={dt.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                                selected.includes(dt.id)
                                    ? "border-accent/40 bg-accent/5"
                                    : "border-border-light hover:border-accent/30"
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(dt.id)}
                                onChange={() => toggle(dt.id)}
                                className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                            />
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <dt.icon className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-heading">{dt.label}</p>
                                <p className="text-xs text-muted mt-0.5">{dt.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6 space-y-5">
                <h2 className="text-base font-semibold text-heading">Export Format</h2>
                <div className="grid grid-cols-3 gap-3">
                    {([
                        { id: "json", label: "JSON", desc: "Machine-readable" },
                        { id: "csv", label: "CSV", desc: "Spreadsheet" },
                        { id: "pdf", label: "PDF", desc: "Human-readable" },
                    ] as const).map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFormat(f.id)}
                            className={`p-4 rounded-xl border-2 text-center transition-colors ${
                                format === f.id ? "border-accent bg-accent/5" : "border-border-light hover:border-accent/30"
                            }`}
                        >
                            <p className="text-base font-bold text-heading">{f.label}</p>
                            <p className="text-xs text-muted mt-0.5">{f.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-base font-semibold text-heading mb-3">Summary</h2>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted">{selected.length} data type(s) selected</span>
                    <span className="text-sm text-muted">Estimated size: ~2.4 MB</span>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting || selected.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
                >
                    {exporting ? (
                        <><LucideLoader2 className="w-4 h-4 animate-spin" /> Generating Export...</>
                    ) : (
                        <><LucideDownload className="w-4 h-4" /> Export {selected.length} Data Type(s)</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DataExport;
