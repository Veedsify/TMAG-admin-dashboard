import { useState } from "react";
import { LucideMail, LucideUpload, LucideX, LucidePlus, LucideDownload, LucideUserCog, LucideShield, LucideUser, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useInviteEmployee } from "../../../api/hooks";

type Role = "Individual" | "HR" | "Administrator";

const roles: { id: Role; label: string; desc: string; icon: typeof LucideUser }[] = [
    { id: "Individual", label: "Individual", desc: "Can create travel plans and submit requests", icon: LucideUser },
    { id: "HR", label: "HR", desc: "Manages team, credits, and travel requests", icon: LucideUserCog },
    { id: "Administrator", label: "Administrator", desc: "Full admin access including billing and settings", icon: LucideShield },
];

const sampleCSV = `email,first_name,last_name,department,role
john.doe@company.com,John,Doe,Engineering,Individual
sarah.smith@company.com,Sarah,Smith,Marketing,Individual
mike.chen@company.com,Michael,Chen,Sales,Individual
emma.wilson@company.com,Emma,Wilson,Human Resources,HR
alex.admin@company.com,Alex,Admin,Management,Administrator`;

const InviteMembers = () => {
    const { data: myCompanies } = useMyCompanies();
    const company = myCompanies?.[0];
    const companyId = company?.id ?? 0;
    const availableCredits = (company?.total_credits ?? 0) - (company?.used_credits ?? 0);
    const inviteEmployee = useInviteEmployee();

    const [inviteMethod, setInviteMethod] = useState<"single" | "bulk">("single");
    const [selectedRole, setSelectedRole] = useState<Role>("Individual");
    const [bulkRole, setBulkRole] = useState<Role>("Individual");
    const [defaultCredits, setDefaultCredits] = useState(5);
    const [invites, setInvites] = useState([{ firstName: "", lastName: "", email: "", department: "" }]);
    const [sending, setSending] = useState(false);

    const addInviteRow = () => {
        setInvites([...invites, { firstName: "", lastName: "", email: "", department: "" }]);
    };

    const removeInviteRow = (index: number) => {
        setInvites(invites.filter((_, i) => i !== index));
    };

    const updateInvite = (index: number, field: keyof typeof invites[0], value: string) => {
        const updated = [...invites];
        updated[index] = { ...updated[index], [field]: value };
        setInvites(updated);
    };

    const handleSendInvites = async () => {
        const valid = invites.filter((i) => i.email.trim() !== "");
        if (valid.length === 0) {
            toast.error("Please enter at least one email address");
            return;
        }
        if (companyId <= 0) {
            toast.error("No company found. Please set up your company first.");
            return;
        }
        const totalRequired = valid.length * defaultCredits;
        if (totalRequired > availableCredits) {
            toast.error(`Not enough credits. Need ${totalRequired}, but only ${availableCredits} available.`);
            return;
        }

        setSending(true);
        let successCount = 0;
        let failCount = 0;

        for (const invite of valid) {
            try {
                await inviteEmployee.mutateAsync({
                    name: `${invite.firstName} ${invite.lastName}`.trim(),
                    email: invite.email.trim(),
                    department: invite.department.trim() || "General",
                    role: selectedRole,
                    creditsAllocated: defaultCredits,
                    companyId,
                });
                successCount++;
            } catch {
                failCount++;
            }
        }

        setSending(false);

        if (successCount > 0) {
            toast.success(`Invitations sent to ${successCount} member(s) as ${selectedRole}`);
            setInvites([{ firstName: "", lastName: "", email: "", department: "" }]);
        }
        if (failCount > 0) {
            toast.error(`${failCount} invitation(s) failed to send`);
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (companyId <= 0) {
            toast.error("No company found. Please set up your company first.");
            return;
        }

        try {
            const text = await file.text();
            const lines = text.trim().split("\n");
            if (lines.length < 2) {
                toast.error("CSV file is empty or has no data rows");
                return;
            }

            const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
            const emailIdx = headers.indexOf("email");
            const firstNameIdx = headers.indexOf("first_name");
            const lastNameIdx = headers.indexOf("last_name");
            const deptIdx = headers.indexOf("department");
            const roleIdx = headers.indexOf("role");

            if (emailIdx === -1) {
                toast.error("CSV must have an 'email' column");
                return;
            }

            const rows = lines.slice(1);
            toast.success(`Processing ${rows.length} member(s)...`);
            setSending(true);

            let successCount = 0;
            let failCount = 0;

            for (const line of rows) {
                const cols = line.split(",").map((c) => c.trim());
                const email = cols[emailIdx];
                if (!email) continue;

                const firstName = firstNameIdx >= 0 ? cols[firstNameIdx] : "";
                const lastName = lastNameIdx >= 0 ? cols[lastNameIdx] : "";
                const department = deptIdx >= 0 ? cols[deptIdx] : "General";
                const role = roleIdx >= 0 && cols[roleIdx] ? cols[roleIdx] : bulkRole;

                try {
                    await inviteEmployee.mutateAsync({
                        name: `${firstName} ${lastName}`.trim() || email,
                        email,
                        department,
                        role,
                        creditsAllocated: defaultCredits,
                        companyId,
                    });
                    successCount++;
                } catch {
                    failCount++;
                }
            }

            setSending(false);

            if (successCount > 0) {
                toast.success(`${successCount} invitation(s) sent successfully`);
            }
            if (failCount > 0) {
                toast.error(`${failCount} invitation(s) failed to send`);
            }
        } catch {
            toast.error("Failed to parse CSV file");
            setSending(false);
        }

        e.target.value = "";
    };

    const handleDownloadSample = () => {
        const blob = new Blob([sampleCSV], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "invite_members_sample.csv";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Sample CSV downloaded");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">Invite Team Members</h1>
                <p className="text-sm text-muted">Add new employees to your company</p>
            </div>

            {/* Credits per invite */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-5">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Default Credits per Invite
                </label>
                <input
                    type="number"
                    min={1}
                    max={availableCredits}
                    value={defaultCredits}
                    onChange={(e) => setDefaultCredits(Math.max(1, Math.min(availableCredits, Number(e.target.value))))}
                    className="w-32 bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                />
                <p className="text-xs text-muted mt-1.5">
                    Each invited member receives this many credits upon signup &mdash;{" "}
                    <span className={availableCredits <= 0 ? "text-red-500 font-semibold" : "font-semibold"}>
                        {availableCredits} credits available
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setInviteMethod("single")}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        inviteMethod === "single"
                            ? "border-accent bg-accent/5"
                            : "border-border-light hover:border-accent/50"
                    }`}
                >
                    <LucideMail className="w-6 h-6 text-accent mb-2" />
                    <p className="text-sm font-semibold text-heading">Manual Entry</p>
                    <p className="text-xs text-muted mt-1">Invite one or more employees manually</p>
                </button>
                <button
                    onClick={() => setInviteMethod("bulk")}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        inviteMethod === "bulk"
                            ? "border-accent bg-accent/5"
                            : "border-border-light hover:border-accent/50"
                    }`}
                >
                    <LucideUpload className="w-6 h-6 text-accent mb-2" />
                    <p className="text-sm font-semibold text-heading">Bulk Upload</p>
                    <p className="text-xs text-muted mt-1">Upload a CSV file with multiple members</p>
                </button>
            </div>

            {inviteMethod === "single" && (
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <h2 className="text-lg font-semibold text-heading mb-4">Assign Role</h2>
                        <p className="text-xs text-muted mb-4">Choose the role for all members you're inviting</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-colors ${
                                        selectedRole === role.id
                                            ? "border-accent bg-accent/5"
                                            : "border-border-light hover:border-accent/50"
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                                        <role.icon className="w-4 h-4 text-accent" />
                                    </div>
                                    <p className="text-sm font-semibold text-heading">{role.label}</p>
                                    <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{role.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                        <div className="px-6 py-4 border-b border-border-light/50 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-heading">Member Details</h2>
                            <span className="text-xs text-muted">{invites.length} member(s)</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[540px]">
                                <thead>
                                    <tr className="border-b border-border-light/50">
                                        {["First Name", "Last Name", "Email", "Department", ""].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light/50">
                                    {invites.map((invite, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={invite.firstName}
                                                    onChange={(e) => updateInvite(index, "firstName", e.target.value)}
                                                    placeholder="John"
                                                    className="w-full bg-background-primary border border-border-light rounded-lg px-3 py-2 text-sm text-heading outline-none focus:border-accent transition-colors"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={invite.lastName}
                                                    onChange={(e) => updateInvite(index, "lastName", e.target.value)}
                                                    placeholder="Doe"
                                                    className="w-full bg-background-primary border border-border-light rounded-lg px-3 py-2 text-sm text-heading outline-none focus:border-accent transition-colors"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="email"
                                                    value={invite.email}
                                                    onChange={(e) => updateInvite(index, "email", e.target.value)}
                                                    placeholder="john@company.com"
                                                    className="w-full bg-background-primary border border-border-light rounded-lg px-3 py-2 text-sm text-heading outline-none focus:border-accent transition-colors"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={invite.department}
                                                    onChange={(e) => updateInvite(index, "department", e.target.value)}
                                                    placeholder="Engineering"
                                                    className="w-full bg-background-primary border border-border-light rounded-lg px-3 py-2 text-sm text-heading outline-none focus:border-accent transition-colors"
                                                />
                                            </td>
                                            <td className="px-4 py-2 w-10">
                                                {invites.length > 1 && (
                                                    <button
                                                        onClick={() => removeInviteRow(index)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                                    >
                                                        <LucideX className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 border-t border-border-light/50">
                            <button
                                onClick={addInviteRow}
                                className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline"
                            >
                                <LucidePlus className="w-4 h-4" />
                                Add another member
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-xl">
                            <LucideShield className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-xs text-heading">
                                All members will be invited as <span className="font-semibold">{selectedRole}</span> &mdash; you can change roles later
                            </span>
                        </div>
                        <button
                            onClick={handleSendInvites}
                            disabled={sending}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors shrink-0 disabled:opacity-50"
                        >
                            {sending ? (
                                <><LucideLoader2 className="w-4 h-4 animate-spin" /> Sending...</>
                            ) : (
                                <><LucideMail className="w-4 h-4" /> Send Invitations</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {inviteMethod === "bulk" && (
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <h2 className="text-lg font-semibold text-heading mb-4">Default Role for CSV Members</h2>
                        <p className="text-xs text-muted mb-4">Role assigned to members where <code className="bg-background-primary px-1 rounded">role</code> column is absent in CSV</p>
                        <div className="flex flex-wrap gap-3">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setBulkRole(role.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                                        bulkRole === role.id
                                            ? "border-accent bg-accent/5 text-accent"
                                            : "border-border-light text-muted hover:border-accent/50"
                                    }`}
                                >
                                    <role.icon className="w-4 h-4" />
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-heading">Upload CSV File</h2>
                            <button
                                onClick={handleDownloadSample}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-button-secondary text-heading text-xs font-semibold hover:bg-border-light transition-colors"
                            >
                                <LucideDownload className="w-3.5 h-3.5" />
                                Download Sample CSV
                            </button>
                        </div>

                        <div className="border-2 border-dashed border-border-light rounded-xl p-8 text-center">
                            <LucideUpload className="w-10 h-10 text-muted mx-auto mb-3" />
                            <p className="text-sm font-medium text-heading mb-1">
                                Drop your CSV file here or click to browse
                            </p>
                            <p className="text-xs text-muted mb-4">
                                Accepts <code className="bg-background-primary px-1 rounded">.csv</code> files up to 5MB
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleBulkUpload}
                                className="hidden"
                                id="csv-upload"
                            />
                            <label
                                htmlFor="csv-upload"
                                className="inline-block px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors cursor-pointer"
                            >
                                Choose File
                            </label>
                        </div>

                        <div className="mt-5 p-4 bg-background-primary rounded-xl space-y-3">
                            <p className="text-xs font-semibold text-heading">Required CSV Columns:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {["email", "first_name", "last_name", "department", "role"].map((col) => (
                                    <div key={col} className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-accent" />
                                        <code className="text-[11px] font-mono text-muted bg-white px-1.5 py-0.5 rounded border border-border-light">{col}</code>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-muted">
                                The <code className="bg-white px-1 rounded border border-border-light">role</code> column is optional. If omitted, members will be assigned as <span className="font-semibold">{bulkRole}</span>.
                                Valid role values: <code className="bg-white px-1 rounded border border-border-light">Individual</code>, <code className="bg-white px-1 rounded border border-border-light">HR</code>, <code className="bg-white px-1 rounded border border-border-light">Administrator</code>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InviteMembers;
