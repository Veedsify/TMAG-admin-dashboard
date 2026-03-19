import { useState } from "react";
import { LucidePlus, LucideCopy, LucideTrash2, LucideCheck, LucideShield } from "lucide-react";
import toast from "react-hot-toast";

const ApiKeys = () => {
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const keys = [
        { id: "1", name: "Production Integration", key: "sk_live_tmag_a1b2c3d4e5f6g7h8i9j0", createdAt: "Jan 15, 2026", lastUsed: "2 hours ago", status: "active" },
        { id: "2", name: "Development", key: "sk_test_tmag_x9y8z7w6v5u4t3s2r1q0", createdAt: "Feb 3, 2026", lastUsed: "1 day ago", status: "active" },
        { id: "3", name: "Zapier Automation", key: "sk_live_tmag_m1n2o3p4q5r6s7t8u9v0", createdAt: "Feb 20, 2026", lastUsed: "Never", status: "active" },
    ];

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        toast.success("API key copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    const handleRevoke = (_id: string, name: string) => {
        toast.success(`${name} has been revoked`);
    };

    const handleCreate = () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for this API key");
            return;
        }
        toast.success(`API key "${newKeyName}" created successfully`);
        setNewKeyName("");
        setShowCreate(false);
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
                    <p className="text-xs text-muted">Keep your API keys secure. Do not share them in public repositories or client-side code. Use environment variables to store keys securely.</p>
                </div>
            </div>

            <div className="flex justify-end">
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
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Key Name
                            </label>
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
                                className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                            >
                                Generate Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                        <thead>
                            <tr className="border-b border-border-light/50">
                                {["Name", "API Key", "Created", "Last Used", "Status", ""].map((h) => (
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
                                            <code className="text-xs font-mono text-muted bg-background-primary px-2 py-1 rounded-lg truncate max-w-[180px]">{k.key}</code>
                                            <button
                                                onClick={() => handleCopy(k.key)}
                                                className="p-1 rounded hover:bg-button-secondary transition-colors flex-shrink-0"
                                            >
                                                {copied === k.key ? (
                                                    <LucideCheck className="w-4 h-4 text-accent" />
                                                ) : (
                                                    <LucideCopy className="w-4 h-4 text-muted" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted">{k.createdAt}</td>
                                    <td className="px-6 py-4 text-sm text-muted">{k.lastUsed}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRevoke(k.id, k.name)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
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
        </div>
    );
};

export default ApiKeys;
