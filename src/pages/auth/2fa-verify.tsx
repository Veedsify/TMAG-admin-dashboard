import { useEffect, useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LucideShieldCheck, LucideLoader2 } from "lucide-react";
import toast from "react-hot-toast";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/api";
import type { TwoFactorMethod } from "../../api/types";

interface VerifyState {
    challengeToken?: string;
    method?: TwoFactorMethod;
}

const RESEND_SECONDS = 30;

const TwoFactorVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeAuth } = useAuth();
    const state = (location.state as VerifyState | null) ?? {};
    const challengeToken = state.challengeToken;
    const method = state.method ?? "EMAIL_OTP";

    const [code, setCode] = useState("");
    const [useBackup, setUseBackup] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [resendIn, setResendIn] = useState(method === "EMAIL_OTP" ? RESEND_SECONDS : 0);
    const errorId = useId();

    useEffect(() => {
        if (!challengeToken) {
            navigate("/auth/login", { replace: true });
        }
    }, [challengeToken, navigate]);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const resend = async () => {
        if (!challengeToken || resendIn > 0) return;
        try {
            await authApi.twoFactorChallenge({ challenge_token: challengeToken });
            setResendIn(RESEND_SECONDS);
            toast.success("A new code was sent to your email");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg ?? "Could not resend the code");
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!challengeToken) return;
        setError("");
        setVerifying(true);
        try {
            const session = await authApi.twoFactorVerify({
                challenge_token: challengeToken,
                code: code.trim(),
                backup: useBackup,
            });
            const expired = completeAuth(session);
            navigate(expired ? "/auth/change-password" : "/admin", { replace: true });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? "Invalid code. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <AnimateIn type="fade">
            <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-darkest">
                    <LucideShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-sm font-semibold leading-tight text-heading">Two-factor verification</p>
                    <p className="text-[10px] leading-tight text-muted">Confirm it&apos;s you to continue</p>
                </div>
            </div>

            <h1 className="mb-2 font-serif text-2xl text-heading md:text-3xl">Enter your code</h1>
            <p className="mb-6 text-sm text-body">
                {useBackup
                    ? "Enter one of your saved backup codes."
                    : method === "TOTP"
                        ? "Enter the 6-digit code from your authenticator app."
                        : "Enter the 6-digit code we emailed to you."}
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
                <div>
                    <label htmlFor="verify-code" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                        {useBackup ? "Backup code" : "Verification code"}
                    </label>
                    <input
                        id="verify-code"
                        type="text"
                        inputMode={useBackup ? "text" : "numeric"}
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={useBackup ? "xxxx-xxxx" : "123456"}
                        aria-describedby={error ? errorId : undefined}
                        aria-invalid={error ? true : undefined}
                        className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm tracking-[0.2em] text-heading outline-none focus:border-accent"
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
                    disabled={verifying || !code.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dark py-3 text-sm font-semibold text-background-primary hover:bg-darkest disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {verifying ? <><LucideLoader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verifying…</> : "Verify & sign in"}
                </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs">
                {method === "EMAIL_OTP" && !useBackup ? (
                    <button
                        type="button"
                        onClick={resend}
                        disabled={resendIn > 0}
                        className="font-semibold text-accent hover:underline disabled:text-muted disabled:no-underline"
                    >
                        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                    </button>
                ) : <span />}
                <button
                    type="button"
                    onClick={() => { setUseBackup((v) => !v); setCode(""); setError(""); }}
                    className="font-semibold text-muted hover:text-heading"
                >
                    {useBackup ? "Use authenticator / email code" : "Use a backup code"}
                </button>
            </div>
        </AnimateIn>
    );
};

export default TwoFactorVerify;
