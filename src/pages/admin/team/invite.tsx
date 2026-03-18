import { useState } from "react";
import { LucideMail, LucideUpload, LucideX, LucidePlus } from "lucide-react";
import toast from "react-hot-toast";

const InviteMembers = () => {
    const [inviteMethod, setInviteMethod] = useState<"single" | "bulk">("single");
    const [emails, setEmails] = useState([""]);

    const addEmailField = () => {
        setEmails([...emails, ""]);
    };

    const removeEmailField = (index: number) => {
        setEmails(emails.filter((_, i) => i !== index));
    };

    const updateEmail = (index: number, value: string) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    const handleSendInvites = () => {
        const validEmails = emails.filter((e) => e.trim() !== "");
        if (validEmails.length === 0) {
            toast.error("Please enter at least one email address");
            return;
        }
        toast.success(`Invitations sent to ${validEmails.length} email(s)`);
        setEmails([""]);
    };

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            toast.success(`Processing ${file.name}...`);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-heading mb-2">Invite Team Members</h1>
                <p className="text-sm text-muted">Add new employees to your company</p>
            </div>

            {/* Method Selection */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">Invite Method</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setInviteMethod("single")}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                            inviteMethod === "single"
                                ? "border-accent bg-accent/5"
                                : "border-border-light hover:border-accent/50"
                        }`}
                    >
                        <LucideMail className="w-6 h-6 text-accent mb-2" />
                        <p className="text-sm font-semibold text-heading">Single/Multiple Invites</p>
                        <p className="text-xs text-muted mt-1">Invite one or more employees manually</p>
                    </button>
                    <button
                        onClick={() => setInviteMethod("bulk")}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                            inviteMethod === "bulk"
                                ? "border-accent bg-accent/5"
                                : "border-border-light hover:border-accent/50"
                        }`}
                    >
                        <LucideUpload className="w-6 h-6 text-accent mb-2" />
                        <p className="text-sm font-semibold text-heading">Bulk Upload</p>
                        <p className="text-xs text-muted mt-1">Upload a CSV file with multiple emails</p>
                    </button>
                </div>
            </div>

            {/* Single/Multiple Invites */}
            {inviteMethod === "single" && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                    <h2 className="text-lg font-semibold text-heading mb-4">Email Addresses</h2>
                    <div className="space-y-3">
                        {emails.map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => updateEmail(index, e.target.value)}
                                    placeholder="employee@company.com"
                                    className="flex-1 bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors"
                                />
                                {emails.length > 1 && (
                                    <button
                                        onClick={() => removeEmailField(index)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                    >
                                        <LucideX className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addEmailField}
                        className="mt-3 flex items-center gap-2 text-sm text-accent font-medium hover:underline"
                    >
                        <LucidePlus className="w-4 h-4" />
                        Add another email
                    </button>

                    <div className="mt-6 pt-6 border-t border-border-light/50 flex justify-end">
                        <button
                            onClick={handleSendInvites}
                            className="px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                        >
                            Send Invitations
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Upload */}
            {inviteMethod === "bulk" && (
                <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                    <h2 className="text-lg font-semibold text-heading mb-4">Upload CSV File</h2>
                    <div className="border-2 border-dashed border-border-light rounded-xl p-8 text-center">
                        <LucideUpload className="w-12 h-12 text-muted mx-auto mb-4" />
                        <p className="text-sm font-medium text-heading mb-2">
                            Drop your CSV file here or click to browse
                        </p>
                        <p className="text-xs text-muted mb-4">
                            CSV should contain columns: email, first_name, last_name, department
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

                    <div className="mt-4 p-4 bg-accent/5 rounded-xl">
                        <p className="text-xs font-semibold text-heading mb-2">CSV Format Example:</p>
                        <code className="text-xs text-muted block">
                            email,first_name,last_name,department
                            <br />
                            john@company.com,John,Doe,Engineering
                            <br />
                            sarah@company.com,Sarah,Chen,Marketing
                        </code>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InviteMembers;
