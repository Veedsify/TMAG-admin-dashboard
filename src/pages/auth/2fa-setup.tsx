import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LucideCopy, LucideCheck, LucideDownload, LucideShieldCheck, LucideLoader2, LucideAlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import AnimateIn from "../../components/animations/AnimateIn";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/api";
import type { TwoFactorMethod, TwoFactorSetupResult } from "../../api/types";

interface SetupState {
    challengeToken?: string;
    method?: TwoFactorMethod;
}

const RESEND_SECONDS = 30;

const TwoFactorSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeAuth } = useAuth();
    const state = (location.state as SetupState | null) ?? {};
    const challengeToken = state.challengeToken;
    const method = state.method ?? "EMAIL_OTP";

    const [setup, setSetup] = useState<TwoFactorSetupResult | null>(null);
    const [loadingSetup, setLoadingSetup] = useState(true);
    const [setupError, setSetupError] = useState("");
    const [code, setCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [copiedCodes, setCopiedCodes] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const requested = useRef(false);

    const errorId = useId();

    useEffect(() => {
        if (!challengeToken) {
            navigate("/auth/login", { replace: true });
        }
    }, [challengeToken, navigate]);

    useEffect(() => {
        if (!challengeToken || requested.current) return;
        requested.current = true;
        (async () => {
            try {
                const result = await authApi.twoFactorSetup({ challenge_token: challengeToken, method });
                setSetup(result);
            } catch (err: unknown) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                setSetupError(msg ?? "Could not start two-factor setup. Please sign in again.");
            } finally {
                setLoadingSetup(false);
            }
        })();
    }, [challengeToken, method]);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const copyBackupCodes = () => {
        if (!setup) return;
        navigator.clipboard.writeText(setup.backupCodes.join("\n"));
        setCopiedCodes(true);
        toast.success("Backup codes copied");
        setTimeout(() => setCopiedCodes(false), 2000);
    };

    const downloadBackupCodes = () => {
        if (!setup) return;
        const blob = new Blob([setup.backupCodes.join("\n") + "\n"], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tmag-backup-codes.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const sendEmailCode = async () => {
        if (!challengeToken || resendIn > 0) return;
        try {
            await authApi.twoFactorChallenge({ challenge_token: challengeToken });
            setEmailSent(true);
            setResendIn(RESEND_SECONDS);
            toast.success("Verification code sent to your email");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg ?? "Could not send the code");
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!challengeToken) return;
        setVerifyError("");
        setVerifying(true);
        try {
            const session = await authApi.twoFactorVerify({ challenge_token: challengeToken, code: code.trim() });
            const expired = completeAuth(session);
            navigate(expired ? "/auth/change-password" : "/admin", { replace: true });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setVerifyError(msg ?? "Invalid code. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    if (setupError) {
        return (
            <AnimateIn type="fade">
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                    <LucideAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>{setupError}</span>
                </div>
                <button
                    onClick={() => navigate("/auth/login", { replace: true })}
                    className="w-full rounded-xl bg-dark py-3 text-sm font-semibold text-background-primary hover:bg-darkest"
                >
                    Back to sign in
                </button>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn type="fade">
            <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-darkest">
                    <LucideShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-sm font-semibold leading-tight text-heading">Set up two-factor authentication</p>
                    <p className="text-[10px] leading-tight text-muted">Required to secure your account</p>
                </div>
            </div>

            {loadingSetup ? (
                <div className="flex items-center justify-center py-12">
                    <LucideLoader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
                    <span className="sr-only">Loading setup…</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {setup && method === "TOTP" && setup.otpauthUri && (
                        <div className="rounded-2xl border border-border-light/60 bg-white p-5">
                            <h2 className="text-sm font-semibold text-heading">1. Add to your authenticator app</h2>
                            <p className="mt-1 text-xs text-muted">
                                Paste this setup link into your authenticator app, or enter the secret key manually.
                            </p>
                            <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">Setup link</label>
                            <code className="mt-1 block w-full break-all rounded-xl bg-background-primary px-3 py-2 text-xs font-mono text-heading">
                                {setup.otpauthUri}
                            </code>
                            {setup.secret && (
                                <>
                                    <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">Manual secret</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <code className="flex-1 break-all rounded-xl bg-background-primary px-3 py-2 text-sm font-mono font-semibold text-accent">
                                            {setup.secret}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => { navigator.clipboard.writeText(setup.secret ?? ""); toast.success("Secret copied"); }}
                                            aria-label="Copy secret key"
                                            className="rounded-xl bg-background-primary p-2.5 hover:bg-accent/10"
                                        >
                                            <LucideCopy className="h-4 w-4 text-muted" aria-hidden="true" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {setup && setup.backupCodes.length > 0 && (
                        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                            <div className="flex items-start gap-2">
                                <LucideAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" aria-hidden="true" />
                                <div>
                                    <h2 className="text-sm font-semibold text-amber-900">Save your backup codes now</h2>
                                    <p className="mt-0.5 text-xs text-amber-800">
                                        These are shown only once. Store them somewhere safe — each code works a single time if you lose access to your authenticator.
                                    </p>
                                </div>
                            </div>
                            <ul className="mt-3 grid grid-cols-2 gap-2" aria-label="Backup codes">
                                {setup.backupCodes.map((bc) => (
                                    <li key={bc} className="rounded-lg bg-white px-3 py-2 text-center text-sm font-mono font-semibold text-heading">
                                        {bc}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={copyBackupCodes}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-heading hover:bg-amber-100"
                                >
                                    {copiedCodes ? <LucideCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <LucideCopy className="h-3.5 w-3.5" aria-hidden="true" />}
                                    {copiedCodes ? "Copied" : "Copy codes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadBackupCodes}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-heading hover:bg-amber-100"
                                >
                                    <LucideDownload className="h-3.5 w-3.5" aria-hidden="true" />
                                    Download
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="rounded-2xl border border-border-light/60 bg-white p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-heading">
                            {method === "TOTP" ? "2. Confirm with a code from your app" : "Confirm with the code sent to your email"}
                        </h2>
                        {method === "EMAIL_OTP" && (
                            <button
                                type="button"
                                onClick={sendEmailCode}
                                disabled={resendIn > 0}
                                className="text-xs font-semibold text-accent hover:underline disabled:text-muted disabled:no-underline"
                            >
                                {resendIn > 0 ? `Resend code in ${resendIn}s` : emailSent ? "Resend code" : "Send code to my email"}
                            </button>
                        )}
                        <div>
                            <label htmlFor="otp-code" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                                Verification code
                            </label>
                            <input
                                id="otp-code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="123456"
                                aria-describedby={verifyError ? errorId : undefined}
                                aria-invalid={verifyError ? true : undefined}
                                className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm tracking-[0.3em] text-heading outline-none focus:border-accent"
                                required
                            />
                        </div>
                        {verifyError && (
                            <p id={errorId} role="alert" className="text-sm text-red-600">
                                {verifyError}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={verifying || !code.trim()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dark py-3 text-sm font-semibold text-background-primary hover:bg-darkest disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {verifying ? <><LucideLoader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verifying…</> : "Enable & continue"}
                        </button>
                    </form>
                </div>
            )}
        </AnimateIn>
    );
};

export default TwoFactorSetup;
