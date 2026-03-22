import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    LucidePlus,
    LucideSearch,
    LucideMoreVertical,
    LucideUserCog,
    LucideUserX,
    LucideLoader2,
} from "lucide-react";
import { useMyCompanies, useEmployees, useUpdateEmployeeStatus, useDeleteEmployee } from "../../../api/hooks";

const TeamMembers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showMenu, setShowMenu] = useState<number | null>(null);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const menuBtnRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    const openMenu = (id: number) => {
        const btn = menuBtnRefs.current.get(id);
        if (btn) {
            const rect = btn.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 4, left: rect.right - 192 }); // 192 = w-48
        }
        setShowMenu(id);
    };

    useEffect(() => {
        if (showMenu === null) return;
        const onScroll = () => setShowMenu(null);
        window.addEventListener("scroll", onScroll, true);
        return () => window.removeEventListener("scroll", onScroll, true);
    }, [showMenu]);

    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: employeesData, isLoading } = useEmployees(
        companyId ? { companyId, per_page: 100, search: searchQuery || undefined } : undefined
    );
    const updateStatus = useUpdateEmployeeStatus();
    const deleteEmployee = useDeleteEmployee();

    const members = employeesData?.data || [];

    const handleStatusChange = (id: number, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        updateStatus.mutate({ id, data: { status: newStatus } });
        setShowMenu(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">Team Members</h1>
                    <p className="text-sm text-muted">Manage your company's team members and roles</p>
                </div>
                <Link
                    to="/admin/team/invite"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                >
                    <LucidePlus className="w-4 h-4" />
                    Invite Members
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background-primary border border-border-light rounded-xl text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <Link
                        to="/admin/team/onboarding"
                        className="px-4 py-2.5 rounded-xl border border-border-light text-sm font-medium text-heading hover:border-accent/50 transition-colors"
                    >
                        Onboarding Status
                    </Link>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-background-primary border-b border-border-light/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Plans
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="hover:bg-background-primary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-heading">{member.name}</p>
                                            <p className="text-xs text-muted">{member.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                                            {member.role || "Member"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                member.status === "active"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {member.status === "active" ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-heading">{member.plansGenerated}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            ref={(el) => { if (el) menuBtnRefs.current.set(member.id, el); }}
                                            onClick={() => showMenu === member.id ? setShowMenu(null) : openMenu(member.id)}
                                            className="p-1 rounded-lg hover:bg-background-primary transition-colors"
                                        >
                                            <LucideMoreVertical className="w-5 h-5 text-muted" />
                                        </button>

                                        {showMenu === member.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(null)} />
                                                <div
                                                    className="fixed w-48 bg-white rounded-xl border border-border-light/50 shadow-lg py-2 z-50"
                                                    style={{ top: menuPos.top, left: menuPos.left }}
                                                >
                                                    <button className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors flex items-center gap-2">
                                                        <LucideUserCog className="w-4 h-4" />
                                                        Change Role
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(member.id, member.status)}
                                                        className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors flex items-center gap-2"
                                                    >
                                                        <LucideUserX className="w-4 h-4" />
                                                        {member.status === "active" ? "Deactivate" : "Activate"}
                                                    </button>
                                                    <button
                                                        onClick={() => { deleteEmployee.mutate(member.id); setShowMenu(null); }}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <LucideUserX className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        {!isLoading && members.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <p className="text-sm text-muted">No team members found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamMembers;
