import { useState } from "react";
import { LucidePlus, LucideCopy, LucideTrash2, LucideCheck, LucideShield, LucideKey, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useApiKeys, useCreateApiKey, useRevokeApiKey } from "../../../api/hooks";

const ApiKeys = () => {
    const { data: myCompanies } = useMyCompanies();
    const company = myCompanies?.[0];
    const companyId = company?.id;

    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [createdKey, setCreatedKey] = useState<string | null>(null);

    const { data: keys = [], isLoading } = useApiKeys(companyId!);
    const createKey = useCreateApiKey();
    const revokeKey = useRevokeApiKey();

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    const handleRevoke = async (id: number, name: string) => {
        if (!window.confirm(`Revoke "${name}"? This action cannot be undone.`)) return;
        if (!companyId) return;
        try {
            await revokeKey.mutateAsync({ id, companyId });
            toast.success(`${name} has been revoked`);
        } catch {
            toast.error("Failed to revoke API key");
        }
    };

    const handleCreate = async () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for this API key");
            return;
        }
        if (!companyId) return;
        try {
            const result = await createKey.mutateAsync({ name: newKeyName.trim(), companyId });
            setCreatedKey(result.fullKey);
            setNewKeyName("");
            setShowCreate(false);
            toast.success(`API key "${result.key.name}" created`);
        } catch {
            toast.error("Failed to create API key");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">API Keys</h1>
                <p className="text-sm text-muted">Manage API keys for integrating TMAG with your systems</p>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-start gap-3">
                <LucideShield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-heading mb-0.5">API Access</p>
                    <p className="text-xs text-muted">Keep your API keys secure. Do not share them in public repositories or client-side code.</p>
                </div>
            </div>

            {/* Company Invite Code */}
            {company && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideKey className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-heading">Company Invite Code</h2>
                            <p className="text-xs text-muted">Use this code to onboard employees to your company</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <code className="flex-1 px-4 py-3 bg-background-primary rounded-xl text-lg font-mono font-semibold text-accent">
                            {company.company_code || "—"}
                        </code>
                        <button
                            onClick={() => handleCopy(company.company_code || "")}
                            className="p-3 rounded-xl bg-background-primary hover:bg-accent/10 transition-colors"
                        >
                            {copied === company.company_code ? (
                                <LucideCheck className="w-5 h-5 text-accent" />
                            ) : (
                                <LucideCopy className="w-5 h-5 text-muted" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Newly created key banner */}
            {createdKey && (
                <div className="bg-accent/5 border border-accent/30 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <LucideCheck className="w-4 h-4 text-accent" />
                        <p className="text-sm font-semibold text-heading">API Key Created</p>
                    </div>
                    <p className="text-xs text-muted mb-3">Copy this key now — you won&apos;t be able to see it again.</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 px-4 py-3 bg-white rounded-xl text-sm font-mono text-heading border border-accent/20">
                            {createdKey}
                        </code>
                        <button
                            onClick={() => handleCopy(createdKey)}
                            className="p-3 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
                        >
                            <LucideCopy className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => setCreatedKey(null)}
                        className="mt-3 text-xs text-muted hover:text-heading transition-colors"
                    >
                        Done, hide key
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold text-heading">Generated API Keys</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                >
                    <LucidePlus className="w-4 h-4" />
                    Create New Key
                </button>
            </div>

            {showCreate && (
                <div className="bg-white rounded-2xl border border-accent/30 p-6">
                    <h2 className="text-sm font-semibold text-heading mb-4">New API Key</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Key Name</label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g. Production Integration"
                                className="w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2.5 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={createKey.isPending}
                                className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {createKey.isPending ? <><LucideLoader2 className="w-4 h-4 animate-spin" /> Generating...</> : "Generate Key"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
            ) : keys.length === 0 && !createdKey ? (
                <div className="bg-white rounded-2xl border border-border-light/50 p-12 text-center">
                    <LucideKey className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-sm font-medium text-heading mb-1">No API keys yet</p>
                    <p className="text-xs text-muted">Create your first API key to start integrating with TMAG.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px]">
                            <thead>
                                <tr className="border-b border-border-light/50">
                                    {["Name", "API Key", "Created", "Status", ""].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {keys.map((k) => (
                                    <tr key={k.id} className="hover:bg-background-secondary/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-heading">{k.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-mono text-muted bg-background-primary px-2 py-1 rounded-lg">
                                                    {k.keyPrefix}••••••••••••••••
                                                </code>
                                                <button className="p-1 rounded hover:bg-button-secondary transition-colors flex-shrink-0" title="Full key not shown for security">
                                                    <LucideKey className="w-4 h-4 text-muted" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">
                                            {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                {k.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRevoke(k.id, k.name)}
                                                disabled={revokeKey.isPending}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                <LucideTrash2 className="w-3.5 h-3.5" />
                                                Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiKeys;
