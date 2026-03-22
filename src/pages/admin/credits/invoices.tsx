import { useState } from "react";
import { Link } from "react-router-dom";
import { LucideArrowLeft, LucideSearch, LucideFileText, LucideLoader2 } from "lucide-react";
import { useInvoices } from "../../../api/hooks";

const Invoices = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
    const { data: invoicesData, isLoading } = useInvoices();

    const invoices = invoicesData?.data ?? [];

    const filtered = invoices.filter((inv) => {
        const matchesSearch = `INV-${inv.id}`.toLowerCase().includes(search.toLowerCase()) || inv.description?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || inv.status?.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPaid = invoices.filter((i) => i.status?.toLowerCase() === "paid").reduce((sum, i) => sum + (i.amount ?? 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Link to="/admin/credits" className="p-2 rounded-xl hover:bg-white transition-colors">
                    <LucideArrowLeft className="w-5 h-5 text-muted" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">Invoices</h1>
                    <p className="text-sm text-muted mt-0.5">View and download your billing history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Paid</span>
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideFileText className="w-5 h-5 text-accent" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif text-heading">${totalPaid.toLocaleString()}</p>
                    <p className="text-xs text-muted mt-1">{invoices.filter((i) => i.status?.toLowerCase() === "paid").length} invoices</p>
                </div>
                <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Invoices</span>
                        <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                            <LucideFileText className="w-5 h-5 text-gold" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif text-heading">{invoices.length}</p>
                    <p className="text-xs text-muted mt-1">{invoices.filter((i) => i.status?.toLowerCase() === "pending").length} pending</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-border-light/50 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-background-primary border border-border-light rounded-xl text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(["all", "paid", "pending"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    statusFilter === f ? "bg-accent text-white" : "bg-button-secondary text-muted hover:bg-border-light"
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[540px]">
                            <thead>
                                <tr className="border-b border-border-light/50">
                                    {["Invoice", "Date", "Description", "Amount", "Status"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {filtered.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-background-secondary/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-accent">INV-{inv.id}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">
                                            {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-heading">{inv.description || "—"}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-heading">
                                            {inv.currency === "NGN" ? "₦" : "$"}{(inv.amount ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                inv.status?.toLowerCase() === "paid" ? "bg-accent/10 text-accent" : "bg-gold/10 text-gold"
                                            }`}>
                                                {inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase() : "Unknown"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="w-12 h-12 rounded-full bg-button-secondary flex items-center justify-center mx-auto mb-3">
                                                <LucideFileText className="w-6 h-6 text-muted" />
                                            </div>
                                            <p className="text-sm text-muted">No invoices found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Invoices;
