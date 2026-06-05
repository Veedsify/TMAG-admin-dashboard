import { useMemo, useState } from "react";
import { LucidePlus, LucideCopy, LucideTrash2, LucideCheck, LucideShield, LucideKey, LucideLoader2, LucideRotateCw } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies, useApiKeys, useCreateApiKey, useRevokeApiKey, useRotateApiKey, useCompanyPlans } from "../../../api/hooks";
import type { ApiKeyResponse } from "../../../api/types";
import Modal from "../../../components/ui/Modal";

const SCOPE_OPTIONS: { value: string; label: string; desc: string }[] = [
    { value: "read", label: "Read", desc: "Read-only access to organization data" },
    { value: "read,write", label: "Read & Write", desc: "Read plus create and update data" },
    { value: "read,write,admin", label: "Full (Admin)", desc: "Read, write, and delete operations" },
];

function errorMessage(error: unknown, fallback: string): string {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    return message ?? fallback;
}

const ApiKeys = () => {
    const { data: myCompanies } = useMyCompanies();
    const company = myCompanies?.[0];
    const companyId = company?.id;
    const { data: plans } = useCompanyPlans();
    const activePlan = useMemo(() => {
        if (!company || !plans) return null;
        return plans.find((plan) => plan.code.toLowerCase() === company.plan.toLocaleLowerCase()) || null;
    }, [company, plans]);

    const hasDiamondApiAccess = useMemo(() => activePlan?.serviceLevel === "PREMIUM", [activePlan]);

    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newKeyScopes, setNewKeyScopes] = useState("read");
    const [newKeyExpiry, setNewKeyExpiry] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [rotateTarget, setRotateTarget] = useState<ApiKeyResponse | null>(null);

    const { data: keys = [], isLoading } = useApiKeys(hasDiamondApiAccess ? companyId : undefined);
    const createKey = useCreateApiKey();
    const revokeKey = useRevokeApiKey();
    const rotateKey = useRotateApiKey();

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    const resetCreateForm = () => {
        setNewKeyName("");
        setNewKeyScopes("read");
        setNewKeyExpiry("");
    };

    const handleRevoke = async (id: number, name: string) => {
        if (!window.confirm(`Revoke "${name}"? This action cannot be undone.`)) return;
        if (!companyId) return;
        try {
            await revokeKey.mutateAsync({ id, companyId });
            toast.success(`${name} has been revoked`);
        } catch (error: unknown) {
            toast.error(errorMessage(error, "Failed to revoke API key"));
        }
    };

    const handleCreate = async () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for this API key");
            return;
        }
        if (!companyId) return;
        try {
            const result = await createKey.mutateAsync({
                name: newKeyName.trim(),
                companyId,
                scopes: newKeyScopes,
                expiresAt: newKeyExpiry ? new Date(newKeyExpiry).toISOString() : undefined,
            });
            setCreatedKey(result.fullKey);
            resetCreateForm();
            setShowCreate(false);
            toast.success(`API key "${result.key.name}" created`);
        } catch (error: unknown) {
            toast.error(errorMessage(error, "Failed to create API key"));
        }
    };

    const handleRotate = async () => {
        if (!rotateTarget || !companyId) return;
        try {
            const result = await rotateKey.mutateAsync({ id: rotateTarget.id, companyId });
            setCreatedKey(result.fullKey);
            toast.success(`API key "${result.key.name}" rotated`);
        } catch (error: unknown) {
            toast.error(errorMessage(error, "Failed to rotate API key"));
        } finally {
            setRotateTarget(null);
        }
    };

    if (!hasDiamondApiAccess) {
        return (
            <div className="space-y-6">
                <div className="mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">API Keys</h1>
                    <p className="text-sm text-muted mt-1">Manage API keys for integrating TMAG with your systems</p>
                </div>
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-8">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <LucideShield className="w-6 h-6 text-accent" aria-hidden="true" />
                    </div>
                    <h2 className="text-lg font-semibold text-heading mb-2">Diamond plan required</h2>
                    <p className="text-sm text-muted">
                        API key management is available to organizations on the Premium plan only. Please upgrade your organization plan to Premium to enable API access.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">API Keys</h1>
                <p className="text-sm text-muted mt-1">Manage API keys for integrating TMAG with your systems</p>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-start gap-3">
                <LucideShield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                    <p className="text-sm font-semibold text-heading mb-0.5">API Access</p>
                    <p className="text-xs text-muted">Keep your API keys secure. Do not share them in public repositories or client-side code.</p>
                </div>
            </div>

            {/* Organization Invite Code */}
            {company && (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <LucideKey className="w-5 h-5 text-accent" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-heading">Organization Invite Code</h2>
                            <p className="text-xs text-muted">Use this code to onboard members to your organization</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <code className="flex-1 px-4 py-3 bg-background-primary rounded-xl text-lg font-mono font-semibold text-accent">
                            {company.company_code || "—"}
                        </code>
                        <button
                            onClick={() => handleCopy(company.company_code || "")}
                            aria-label="Copy organization invite code"
                            className="p-3 rounded-xl bg-background-primary hover:bg-accent/10 transition-colors"
                        >
                            {copied === company.company_code ? (
                                <LucideCheck className="w-5 h-5 text-accent" aria-hidden="true" />
                            ) : (
                                <LucideCopy className="w-5 h-5 text-muted" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Newly created / rotated key banner — shown exactly once */}
            {createdKey && (
                <div className="bg-accent/5 border border-accent/30 rounded-2xl p-5" role="alert">
                    <div className="flex items-center gap-2 mb-3">
                        <LucideCheck className="w-4 h-4 text-accent" aria-hidden="true" />
                        <p className="text-sm font-semibold text-heading">API Key Ready</p>
                    </div>
                    <p className="text-xs text-muted mb-3">Copy this key now — you won&apos;t be able to see it again.</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 px-4 py-3 bg-white rounded-xl text-sm font-mono text-heading border border-accent/20 break-all">
                            {createdKey}
                        </code>
                        <button
                            onClick={() => handleCopy(createdKey)}
                            aria-label="Copy new API key"
                            className="p-3 rounded-xl bg-dark text-background-primary hover:bg-darkest transition-colors duration-200"
                        >
                            <LucideCopy className="w-4 h-4" aria-hidden="true" />
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
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                >
                    <LucidePlus className="w-4 h-4" aria-hidden="true" />
                    Create New Key
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin" aria-hidden="true" />
                    <span className="sr-only">Loading API keys…</span>
                </div>
            ) : keys.length === 0 && !createdKey ? (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-12 text-center">
                    <LucideKey className="w-10 h-10 text-muted mx-auto mb-3" aria-hidden="true" />
                    <p className="text-sm font-medium text-heading mb-1">No API keys yet</p>
                    <p className="text-xs text-muted">Create your first API key to start integrating with TMAG.</p>
                </div>
            ) : (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                            <thead>
                                <tr className="border-b border-border-light/50">
                                    {["Name", "API Key", "Scopes", "Usage", "Created", "Status", ""].map((h, i) => (
                                        <th key={h || `actions-${i}`} className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
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
                                            <code className="text-xs font-mono text-muted bg-background-primary px-2 py-1 rounded-lg">
                                                {k.keyPrefix}••••••••••••••••
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(k.scopes ? k.scopes.split(",") : []).map((s) => (
                                                    <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent">
                                                        {s.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted tabular-nums">
                                            {k.usageCount?.toLocaleString() ?? "0"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">
                                            {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${k.status === "ACTIVE" ? "bg-accent/10 text-accent" : "bg-red-50 text-red-600"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${k.status === "ACTIVE" ? "bg-accent" : "bg-red-500"}`} aria-hidden="true" />
                                                {k.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {k.status === "ACTIVE" && (
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => setRotateTarget(k)}
                                                        disabled={rotateKey.isPending}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-heading bg-button-secondary hover:bg-border-light transition-colors disabled:opacity-50"
                                                    >
                                                        <LucideRotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                                                        Rotate
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevoke(k.id, k.name)}
                                                        disabled={revokeKey.isPending}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    >
                                                        <LucideTrash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                        Revoke
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create key modal */}
            <Modal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="Create API key"
                description="Choose what this key can do. The full key is shown only once after creation."
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="key-name" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Key Name</label>
                        <input
                            id="key-name"
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g. Production Integration"
                            className="w-full bg-button-secondary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    <fieldset>
                        <legend className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Scopes</legend>
                        <div className="space-y-2">
                            {SCOPE_OPTIONS.map((opt) => (
                                <label
                                    key={opt.value}
                                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${newKeyScopes === opt.value ? "border-accent bg-accent/5" : "border-border-light bg-button-secondary"}`}
                                >
                                    <input
                                        type="radio"
                                        name="api-key-scope"
                                        value={opt.value}
                                        checked={newKeyScopes === opt.value}
                                        onChange={() => setNewKeyScopes(opt.value)}
                                        className="mt-0.5 accent-accent"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-heading">{opt.label}</span>
                                        <span className="block text-xs text-muted">{opt.desc}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <label htmlFor="key-expiry" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Expiry (optional)</label>
                        <input
                            id="key-expiry"
                            type="date"
                            value={newKeyExpiry}
                            onChange={(e) => setNewKeyExpiry(e.target.value)}
                            className="w-full bg-button-secondary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-1">
                        <button
                            onClick={() => setShowCreate(false)}
                            className="px-4 py-2.5 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={createKey.isPending}
                            className="px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {createKey.isPending ? <><LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Generating…</> : "Generate Key"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Rotate confirmation modal */}
            <Modal
                open={rotateTarget !== null}
                onClose={() => setRotateTarget(null)}
                title="Rotate API key"
                description={rotateTarget ? `Generate a new secret for "${rotateTarget.name}". The current key keeps working for 24 hours so you can update integrations, then it stops. The new key inherits the same scopes and is shown only once.` : ""}
            >
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setRotateTarget(null)}
                        className="px-4 py-2.5 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRotate}
                        disabled={rotateKey.isPending}
                        className="px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
                    >
                        {rotateKey.isPending ? <><LucideLoader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Rotating…</> : "Rotate key"}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ApiKeys;
