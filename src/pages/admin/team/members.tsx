import { useState } from "react";
import { Link } from "react-router-dom";
import {
    LucidePlus,
    LucideSearch,
    LucideMoreVertical,
    LucideUserCog,
    LucideUserX,
    LucideShield,
} from "lucide-react";

const TeamMembers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showMenu, setShowMenu] = useState<number | null>(null);

    const members = [
        { id: 1, name: "Sarah Chen", email: "sarah@techcorp.com", role: "Admin", status: "Active", plans: 5 },
        { id: 2, name: "John Doe", email: "john@techcorp.com", role: "Individual", status: "Active", plans: 3 },
        { id: 3, name: "Emma Wilson", email: "emma@techcorp.com", role: "Individual", status: "Active", plans: 2 },
        { id: 4, name: "Michael Brown", email: "michael@techcorp.com", role: "Individual", status: "Inactive", plans: 0 },
    ];

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
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
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-background-primary/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-heading">{member.name}</p>
                                        <p className="text-xs text-muted">{member.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            member.role === "Admin"
                                                ? "bg-accent/10 text-accent"
                                                : "bg-border-light text-muted"
                                        }`}
                                    >
                                        {member.role === "Admin" && <LucideShield className="w-3 h-3" />}
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            member.status === "Active"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-heading">{member.plans}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative inline-block">
                                        <button
                                            onClick={() => setShowMenu(showMenu === member.id ? null : member.id)}
                                            className="p-1 rounded-lg hover:bg-background-primary transition-colors"
                                        >
                                            <LucideMoreVertical className="w-5 h-5 text-muted" />
                                        </button>

                                        {showMenu === member.id && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-border-light/50 shadow-lg py-2 z-10">
                                                <button className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors flex items-center gap-2">
                                                    <LucideUserCog className="w-4 h-4" />
                                                    Change Role
                                                </button>
                                                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                                    <LucideUserX className="w-4 h-4" />
                                                    Deactivate
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamMembers;
