import { useState, useEffect } from "react";
import { LucidePlus, LucideCopy, LucideTrash2, LucideCheck, LucideShield, LucideKey } from "lucide-react";
import toast from "react-hot-toast";
import { useMyCompanies } from "../../../api/hooks";

interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    status: "active" | "revoked";
}

function generateKey(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const segments = [8, 4, 4, 4, 12];
    return "sk_live_tmag_" + segments.map((len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")).join("_");
}

const STORAGE_KEY = "tmag_api_keys";

function loadKeys(): ApiKey[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveKeys(keys: ApiKey[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

const ApiKeys = () => {
    const { data: myCompanies } = useMyCompanies();
    const company = myCompanies?.[0];
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [keys, setKeys] = useState<ApiKey[]>([]);

    useEffect(() => {
        setKeys(loadKeys().filter((k) => k.status === "active"));
    }, []);

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    const handleRevoke = (id: string, name: string) => {
        if (!window.confirm(`Revoke "${name}"? This action cannot be undone.`)) return;
        const updated = keys.map((k) => k.id === id ? { ...k, status: "revoked" as const } : k);
        setKeys(updated.filter((k) => k.status === "active"));
        saveKeys(updated);
        toast.success(`${name} has been revoked`);
    };

    const handleCreate = () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for this API key");
            return;
        }
        const newKey: ApiKey = {
            id: crypto.randomUUID(),
            name: newKeyName.trim(),
            key: generateKey(),
            createdAt: new Date().toLocaleDateString(),
            status: "active",
        };
        const allKeys = [...loadKeys(), newKey];
        saveKeys(allKeys);
        setKeys(allKeys.filter((k) => k.status === "active"));
        setNewKeyName("");
        setShowCreate(false);
        toast.success(`API key "${newKey.name}" created`);
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
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreate} className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">
                                Generate Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {keys.length === 0 ? (
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
                                                <code className="text-xs font-mono text-muted bg-background-primary px-2 py-1 rounded-lg truncate max-w-[220px]">{k.key}</code>
                                                <button onClick={() => handleCopy(k.key)} className="p-1 rounded hover:bg-button-secondary transition-colors flex-shrink-0">
                                                    {copied === k.key ? <LucideCheck className="w-4 h-4 text-accent" /> : <LucideCopy className="w-4 h-4 text-muted" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">{k.createdAt}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleRevoke(k.id, k.name)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
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
