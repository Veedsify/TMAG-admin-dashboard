import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    LucideSearch,
    LucideUserPlus,
    LucideMoreHorizontal,
    LucideLoader2,
    LucideCheck,
    LucideX,
    LucideCoins,
    LucideUsers,
    LucidePlusCircle,
    LucideUserCog,
    LucideSend,
    LucideCheckCircle,
    LucideClock,
    LucideCircle,
} from "lucide-react";
import { useMyCompanies, useEmployees, useInviteEmployee, useAllocateEmployeeCredits, useUpdateEmployeeStatus, useDeleteEmployee, useEmployeePlanUsage, useAssignExtraPlans, useUpdateEmployee, useRemindOnboarding } from "../../../api/hooks";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const AVAILABLE_ROLES = ["Individual", "HR", "Administrator"];
const MENU_WIDTH = 176;
const MENU_HEIGHT = 280;
const MENU_MARGIN = 8;



function employeeDisplayName(name: string | null | undefined, email: string | null | undefined) {
    const trimmedName = name?.trim();
    if (trimmedName) return trimmedName;
    const emailName = email?.split("@", 1)[0]?.trim();
    return emailName || "Unnamed employee";
}

function employeeInitial(name: string | null | undefined, email: string | null | undefined) {
    return employeeDisplayName(name, email).charAt(0).toUpperCase();
}


const Employees = () => {
    const navigate = useNavigate();
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyIdNum = company?.id;

    const [search, setSearch] = useState("");
    const [showInvite, setShowInvite] = useState(false);
    const [inviteFirstName, setInviteFirstName] = useState("");
    const [inviteLastName, setInviteLastName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDept, setInviteDept] = useState("");
    const [inviteRole, setInviteRole] = useState("Individual");
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [allocatingFor, setAllocatingFor] = useState<number | null>(null);
    const [newCredits, setNewCredits] = useState("");
    const [changingRoleFor, setChangingRoleFor] = useState<number | null>(null);
    const [assigningFor, setAssigningFor] = useState<number | null>(null);
    const [assignCount, setAssignCount] = useState("");

    const isSeat = company?.billing_model === "SEAT";

    const { data: employeesData, isLoading } = useEmployees({
        companyId: companyIdNum,
        search: search || undefined,
    });
    const { data: planUsage } = useEmployeePlanUsage(isSeat ? companyIdNum : undefined);
    const inviteEmployee = useInviteEmployee();
    const allocateCredits = useAllocateEmployeeCredits();
    const updateStatus = useUpdateEmployeeStatus();
    const deleteEmployee = useDeleteEmployee();
    const assignExtraPlans = useAssignExtraPlans();
    const updateEmployee = useUpdateEmployee();
    const remindOnboarding = useRemindOnboarding();

    const employees = employeesData?.data || [];
    const usageByEmployee = new Map((planUsage ?? []).map((u) => [u.employeeId, u]));
    const openMenuEmployee = employees.find((emp) => emp.id === menuOpenId);

    const handleAssignExtraPlans = (id: number) => {
        const count = parseInt(assignCount);
        if (!companyIdNum) return;
        if (isNaN(count) || count <= 0) {
            toast.error("Please enter a valid number of plans");
            return;
        }
        assignExtraPlans.mutate(
            { companyId: companyIdNum, employeeId: id, count },
            {
                onSuccess: () => {
                    setAssigningFor(null);
                    setAssignCount("");
                    toast.success("Extra plans assigned");
                },
                onError: (error) => {
                    if (error instanceof AxiosError) toast.error(error?.response?.data?.message || error?.response?.data?.error || "Failed to assign plans");
                    else toast.error("Failed to assign plans");
                },
            }
        );
    };
    const handleInvite = () => {
        if (!companyIdNum || !inviteFirstName || !inviteEmail) return;
        inviteEmployee.mutate(
            {
                companyId: companyIdNum,
                firstName: inviteFirstName,
                lastName: inviteLastName,
                email: inviteEmail,
                department: inviteDept,
                role: inviteRole,
            },
            {
                onSuccess: () => {
                    setShowInvite(false);
                    setInviteFirstName("");
                    setInviteLastName("");
                    setInviteEmail("");
                    setInviteDept("");
                    setInviteRole("Individual");
                    toast.success("Employee invited successfully");
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(error?.response?.data?.error || "Failed to invite employee");
                    } else {
                        toast.error("Failed to invite employee");
                    }
                },
            }
        );
    };

    const handleAllocateCredits = (id: number) => {
        const amount = parseInt(newCredits);
        if (!companyIdNum) return;
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid credit amount");
            return;
        }
        allocateCredits.mutate(
            { id, data: { creditsAllocated: amount } },
            {
                onSuccess: () => {
                    setAllocatingFor(null);
                    setNewCredits("");
                    toast.success("Credits allocated successfully");
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(error?.response?.data?.error || "Failed to allocate credits");
                    } else {
                        toast.error("Failed to allocate credits");
                    }
                },
            }
        );
    };

    const toggleEmployeeMenu = (id: number, event: MouseEvent<HTMLButtonElement>) => {
        if (menuOpenId === id) {
            setMenuOpenId(null);
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const maxLeft = window.innerWidth - MENU_WIDTH - MENU_MARGIN;
        const belowTop = rect.bottom + 4;
        const aboveTop = rect.top - MENU_HEIGHT - 4;

        setMenuPosition({
            left: Math.max(MENU_MARGIN, Math.min(rect.right - MENU_WIDTH, maxLeft)),
            top: belowTop + MENU_HEIGHT <= window.innerHeight - MENU_MARGIN
                ? belowTop
                : Math.max(MENU_MARGIN, aboveTop),
        });
        setMenuOpenId(id);
    };

    const handleRemoveEmployee = (id: number) => {
        deleteEmployee.mutate(id, {
            onSuccess: () => {
                toast.success("Employee removed");
                setMenuOpenId(null);
            },
            onError: () => toast.error("Failed to remove employee"),
        });
    };

    const handleRoleChange = (id: number, newRole: string) => {
        updateEmployee.mutate(
            { id, data: { role: newRole } },
            {
                onSuccess: () => {
                    toast.success("Role updated");
                    setChangingRoleFor(null);
                },
                onError: () => toast.error("Failed to update role"),
            }
        );
    };

    const deriveOnboardingStatus = (status: string, creditsUsed: number, plansGenerated: number) => {
        if (status === "active" && (creditsUsed > 0 || plansGenerated > 0)) return "completed";
        if (status === "active") return "in_progress";
        return "not_started";
    };

    const onboardingBadge = (emp: typeof employees[0]) => {
        const status = deriveOnboardingStatus(emp.status, emp.creditsUsed, emp.plansGenerated);
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        <LucideCheckCircle className="w-3.5 h-3.5" />
                        Completed
                    </span>
                );
            case "in_progress":
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <LucideClock className="w-3.5 h-3.5" />
                        In progress
                    </span>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted bg-button-secondary px-2.5 py-1 rounded-full">
                            <LucideCircle className="w-3.5 h-3.5" />
                            Not started
                        </span>
                        <button
                            onClick={() => {
                                remindOnboarding.mutate(emp.id, {
                                    onSuccess: () => toast.success(`Reminder sent to ${emp.email}`),
                                    onError: () => toast.error("Failed to send reminder"),
                                });
                            }}
                            disabled={remindOnboarding.isPending}
                            className="p-1 rounded-lg hover:bg-accent/10 text-accent transition-colors disabled:opacity-50 cursor-pointer"
                            title="Send reminder"
                        >
                            <LucideSend className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Employees</h1>
                    <p className="text-sm text-muted mt-1">Manage your company&apos;s employees, invite new members, and allocate credits</p>
                </div>
                <button
                    onClick={() => setShowInvite(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 self-start cursor-pointer"
                >
                    <LucideUserPlus className="w-4 h-4" />
                    Invite Employee
                </button>
            </div>

            {/* Search */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-4">
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search employees by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted outline-none focus:border-accent transition-colors"
                    />
                </div>
            </div>

            {/* Invite form */}
            {showInvite && (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                    <h3 className="text-base font-semibold text-heading mb-4">Invite New Employee</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <input
                            value={inviteFirstName}
                            onChange={(e) => setInviteFirstName(e.target.value)}
                            placeholder="First name"
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors"
                        />
                        <input
                            value={inviteLastName}
                            onChange={(e) => setInviteLastName(e.target.value)}
                            placeholder="Last name"
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors"
                        />
                        <input
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Email address"
                            type="email"
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input
                            value={inviteDept}
                            onChange={(e) => setInviteDept(e.target.value)}
                            placeholder="Department (optional)"
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors"
                        />
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        >
                            {AVAILABLE_ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleInvite}
                            disabled={inviteEmployee.isPending || !inviteFirstName || !inviteEmail}
                            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {inviteEmployee.isPending && <LucideLoader2 className="w-3.5 h-3.5 animate-spin" />}
                            Send invite
                        </button>
                        <button
                            onClick={() => setShowInvite(false)}
                            className="py-2.5 px-5 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Employees table */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-visible">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px]">
                        <thead className="bg-background-primary border-b border-border-light/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{isSeat ? "Plan usage" : "Credits"}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Plans</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Onboarding</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center">
                                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => {
                                const displayName = employeeDisplayName(emp.name, emp.email);
                                return (
                                <tr key={emp.id} className="hover:bg-background-primary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/admin/employees/${emp.id}`)}
                                            className="flex items-center gap-3 text-left cursor-pointer group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-button-secondary flex items-center justify-center text-xs font-semibold text-heading shrink-0">
                                                {employeeInitial(emp.name, emp.email)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-heading group-hover:text-accent transition-colors">{displayName}</p>
                                                <p className="text-xs text-muted">{emp.email || "No email on file"}</p>
                                            </div>
                                        </button>
                                        {allocatingFor === emp.id && (
                                            <div className="flex items-center gap-2 mt-2 max-w-xs">
                                                <input
                                                    type="number"
                                                    value={newCredits}
                                                    onChange={(e) => setNewCredits(e.target.value)}
                                                    placeholder="Credits to add"
                                                    className="border border-border-light rounded-lg px-3 py-1.5 text-sm text-heading outline-none focus:border-accent flex-1 min-w-0"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAllocateCredits(emp.id);
                                                        if (e.key === "Escape") {
                                                            setAllocatingFor(null);
                                                            setNewCredits("");
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleAllocateCredits(emp.id)}
                                                    disabled={allocateCredits.isPending}
                                                    className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors disabled:opacity-50"
                                                >
                                                    <LucideCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setAllocatingFor(null); setNewCredits(""); }}
                                                    className="p-1.5 rounded-lg hover:bg-button-secondary text-muted transition-colors"
                                                >
                                                    <LucideX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-body">{emp.department || "—"}</td>
                                    <td className="px-6 py-4">
                                        {isSeat ? (() => {
                                            const u = usageByEmployee.get(emp.id);
                                            if (!u) return <span className="text-xs text-muted">—</span>;
                                            return (
                                                <div className="text-sm leading-tight">
                                                    <div>
                                                        <span className="text-heading font-medium">{u.includedUsed}</span>
                                                        <span className="text-xs text-muted"> / {u.includedLimit} included</span>
                                                    </div>
                                                    {u.extraAllocated > 0 && (
                                                        <div className="text-xs text-muted">{u.extraUsed} / {u.extraAllocated} extra</div>
                                                    )}
                                                </div>
                                            );
                                        })() : (
                                            <>
                                                <span className="text-sm text-heading font-medium">{emp.creditsUsed}</span>
                                                <span className="text-xs text-muted"> / {emp.creditsAllocated}</span>
                                            </>
                                        )}
                                        {assigningFor === emp.id && (
                                            <div className="flex items-center gap-2 mt-2 max-w-xs">
                                                <input
                                                    type="number"
                                                    value={assignCount}
                                                    onChange={(e) => setAssignCount(e.target.value)}
                                                    placeholder="Extra plans"
                                                    className="border border-border-light rounded-lg px-3 py-1.5 text-sm text-heading outline-none focus:border-accent flex-1 min-w-0"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAssignExtraPlans(emp.id);
                                                        if (e.key === "Escape") { setAssigningFor(null); setAssignCount(""); }
                                                    }}
                                                />
                                                <button onClick={() => handleAssignExtraPlans(emp.id)} disabled={assignExtraPlans.isPending} className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors disabled:opacity-50">
                                                    <LucideCheck className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setAssigningFor(null); setAssignCount(""); }} className="p-1.5 rounded-lg hover:bg-button-secondary text-muted transition-colors">
                                                    <LucideX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-body">{emp.plansGenerated}</td>
                                    <td className="px-6 py-4">
                                        {changingRoleFor === emp.id ? (
                                            <div className="flex items-center gap-1">
                                                <select
                                                    defaultValue={emp.role === "Admin" ? "Administrator" : emp.role || "Individual"}
                                                    onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                                                    className="border border-border-light rounded-lg px-2 py-1 text-xs font-semibold text-heading outline-none focus:border-accent"
                                                    autoFocus
                                                    onBlur={() => setChangingRoleFor(null)}
                                                >
                                                    {AVAILABLE_ROLES.map((r) => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                                                {emp.role || "Individual"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            emp.status === "active" ? "text-accent bg-accent/10" : "text-muted bg-button-secondary"
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {onboardingBadge(emp)}
                                    </td>
                                    <td className="px-6 py-4 relative text-right">
                                        <button
                                            onClick={(event) => toggleEmployeeMenu(emp.id, event)}
                                            className="p-1.5 rounded-lg hover:bg-button-secondary transition-colors duration-150 cursor-pointer"
                                        >
                                            <LucideMoreHorizontal className="w-4 h-4 text-muted" />
                                        </button>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                        {!isLoading && employees.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center">
                                    <LucideUsers className="w-10 h-10 text-muted mx-auto mb-3" />
                                    <p className="text-base font-semibold text-heading mb-1">No employees found</p>
                                    <p className="text-sm text-muted mb-4">Invite your first employee to get started</p>
                                    <button
                                        onClick={() => setShowInvite(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors cursor-pointer"
                                    >
                                        <LucideUserPlus className="w-4 h-4" />
                                        Invite Employee
                                    </button>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {openMenuEmployee && menuPosition && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                    <div
                        className="fixed bg-white border border-border-light rounded-xl shadow-lg z-20 min-w-44 py-1"
                        style={menuPosition}
                    >
                        {isSeat ? (
                            <button
                                onClick={() => { setAssigningFor(openMenuEmployee.id); setMenuOpenId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <LucidePlusCircle className="w-3.5 h-3.5" />
                                Assign extra plans
                            </button>
                        ) : (
                            <button
                                onClick={() => { setAllocatingFor(openMenuEmployee.id); setMenuOpenId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <LucideCoins className="w-3.5 h-3.5" />
                                Allocate credits
                            </button>
                        )}
                        <button
                            onClick={() => {
                                remindOnboarding.mutate(openMenuEmployee.id, {
                                    onSuccess: () => toast.success(`Reminder sent to ${openMenuEmployee.email}`),
                                    onError: () => toast.error("Failed to send reminder"),
                                });
                                setMenuOpenId(null);
                            }}
                            disabled={remindOnboarding.isPending}
                            className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <LucideSend className="w-3.5 h-3.5" />
                            Send reminder
                        </button>
                        <div className="border-t border-border-light/50 my-1" />
                        <button
                            onClick={() => { setChangingRoleFor(openMenuEmployee.id); setMenuOpenId(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <LucideUserCog className="w-3.5 h-3.5" />
                            Change role
                        </button>
                        <button
                            onClick={() => {
                                updateStatus.mutate({ id: openMenuEmployee.id, data: { status: openMenuEmployee.status === "active" ? "inactive" : "active" } });
                                setMenuOpenId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors cursor-pointer"
                        >
                            {openMenuEmployee.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                            onClick={() => handleRemoveEmployee(openMenuEmployee.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            Remove
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Employees;
