import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LucideKeyRound, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAuth } from "../../context/AuthContext";
import { useUpdateProfilePassword } from "../../api/hooks";

const ChangePassword = () => {
    const navigate = useNavigate();
    const { passwordExpired, clearPasswordExpired } = useAuth();
    const updatePassword = useUpdateProfilePassword();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const errorId = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!currentPassword || !newPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        try {
            await updatePassword.mutateAsync({ current_password: currentPassword, new_password: newPassword });
            clearPasswordExpired();
            toast.success("Password updated successfully");
            navigate("/admin", { replace: true });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? "Failed to update password.");
        }
    };

    return (
        <AnimateIn type="fade">
            <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-darkest">
                    <LucideKeyRound className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-sm font-semibold leading-tight text-heading">Update your password</p>
                    <p className="text-[10px] leading-tight text-muted">TMAG Admin Portal</p>
                </div>
            </div>

            <h1 className="mb-2 font-serif text-2xl text-heading md:text-3xl">
                {passwordExpired ? "Your password has expired" : "Change your password"}
            </h1>
            <p className="mb-6 text-sm text-body">
                {passwordExpired
                    ? "For security, you must set a new password before continuing. It cannot match any of your last 5 passwords."
                    : "Choose a new password. It cannot match any of your last 5 passwords."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="cp-current" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                        Current password
                    </label>
                    <input
                        id="cp-current"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-heading outline-none focus:border-accent"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cp-new" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                        New password
                    </label>
                    <input
                        id="cp-new"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        aria-describedby={error ? errorId : undefined}
                        className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-heading outline-none focus:border-accent"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cp-confirm" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                        Confirm new password
                    </label>
                    <input
                        id="cp-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-heading outline-none focus:border-accent"
                        required
                    />
                </div>

                {error && (
                    <p id={errorId} role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={updatePassword.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dark py-3 text-sm font-semibold text-background-primary hover:bg-darkest disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {updatePassword.isPending ? <><LucideLoader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Updating…</> : "Update password & continue"}
                </button>
            </form>
        </AnimateIn>
    );
};

export default ChangePassword;
