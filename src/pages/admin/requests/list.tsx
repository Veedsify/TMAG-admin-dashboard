import { useState } from "react";
import { LucideSearch, LucideCheck, LucideX, LucideCoins, LucideFilter, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useCreditRequests, useApproveCreditRequest, useRejectCreditRequest } from "../../../api/hooks";

const CreditRequests = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("all");
    const [selected, setSelected] = useState<number[]>([]);

    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: requestsData, isLoading } = useCreditRequests(
        companyId ? { companyId, per_page: 50 } : undefined
    );
    const approveRequest = useApproveCreditRequest();
    const rejectRequest = useRejectCreditRequest();

    const requests = requestsData?.data || [];

    const filtered = requests.filter((r: { employeeName?: string; creditsRequested: number; reason?: string; status: string }) => {
        const matchesSearch =
            (r.employeeName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
            (r.reason?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
            String(r.creditsRequested).includes(search);
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleApprove = (id: number) => {
        approveRequest.mutate(id, {
            onSuccess: () => toast.success("Credit request approved"),
            onError: () => toast.error("Failed to approve request"),
        });
        setSelected((p) => p.filter((s) => s !== id));
    };

    const handleReject = (id: number) => {
        rejectRequest.mutate(id, {
            onSuccess: () => toast.success("Credit request rejected"),
            onError: () => toast.error("Failed to reject request"),
        });
        setSelected((p) => p.filter((s) => s !== id));
    };

    const handleBulkApprove = () => {
        selected.forEach((id) => approveRequest.mutate(id));
        toast.success(`${selected.length} request(s) approved`);
        setSelected([]);
    };

    const handleBulkReject = () => {
        selected.forEach((id) => rejectRequest.mutate(id));
        toast.success(`${selected.length} request(s) rejected`);
        setSelected([]);
    };

    const toggleSelect = (id: number) => {
        setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
    };

    const statusBadge = (status: string) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            status === "PENDING" ? "bg-gold/10 text-gold" :
            status === "APPROVED" ? "bg-accent/10 text-accent" :
            "bg-red-50 text-red-600"
        }`}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Credit Requests</h1>
                <p className="text-sm text-muted mt-1">Review and manage employee credit requests</p>
            </div>

            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-4">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by employee, reason, or credits..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    statusFilter === f ? "bg-dark text-background-primary" : "bg-button-secondary text-muted hover:bg-border-light"
                                }`}
                            >
                                {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {selected.length > 0 && (
                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-heading">{selected.length} request(s) selected</span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkApprove}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                        >
                            <LucideCheck className="w-4 h-4" />
                            Approve All
                        </button>
                        <button
                            onClick={handleBulkReject}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
                        >
                            <LucideX className="w-4 h-4" />
                            Reject All
                        </button>
                    </div>
                </div>
            )}

            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                        <thead>
                            <tr className="border-b border-border-light/50">
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filtered.length > 0 && selected.length === filtered.length}
                                        onChange={(e) => setSelected(e.target.checked ? filtered.map((r: { id: number }) => r.id) : [])}
                                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                                    />
                                </th>
                                {["Employee", "Credits Requested", "Reason", "Status", "Submitted", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((req: { id: number; employeeName?: string; employeeId?: number; creditsRequested: number; reason?: string; status: string; submittedAt?: string }) => (
                                    <tr key={req.id} className={`hover:bg-background-secondary/50 transition-colors ${selected.includes(req.id) ? "bg-accent/5" : ""}`}>
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(req.id)}
                                                onChange={() => toggleSelect(req.id)}
                                                className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-semibold text-accent">{(req.employeeName || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                                                </div>
                                                <span className="text-sm font-medium text-heading">{req.employeeName || `Employee #${req.employeeId}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-heading font-semibold">
                                                <LucideCoins className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                                                {req.creditsRequested} credits
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-muted max-w-[200px] truncate">{req.reason || "No reason provided"}</td>
                                        <td className="px-4 py-4">{statusBadge(req.status)}</td>
                                        <td className="px-4 py-4 text-sm text-muted">{req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "N/A"}</td>
                                        <td className="px-4 py-4">
                                            {req.status === "PENDING" && (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={approveRequest.isPending}
                                                        className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        <LucideCheck className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        disabled={rejectRequest.isPending}
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <LucideX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!isLoading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="w-12 h-12 rounded-full bg-button-secondary flex items-center justify-center mx-auto mb-3">
                                            <LucideFilter className="w-6 h-6 text-muted" />
                                        </div>
                                        <p className="text-sm text-muted">No credit requests match your filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CreditRequests;