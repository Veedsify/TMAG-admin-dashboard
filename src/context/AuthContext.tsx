import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import api, { getAuthCookie, removeAuthCookie, setAuthCookie } from "../api/axios";
import { queryclient } from "../lib/queryclient";
import type { CompanyAdminUser } from "../api/types";


// ─── Types ───────────────────────────────────────────────────

export type AdminRole = "super_admin" | "client_admin" | "support_admin";

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: AdminRole;
    status: string;
    lastLogin: string;
    createdAt: string;
    permissions: string[];
}

/** Result of `login()` so the login page can branch the flow. */
export type LoginOutcome =
    | { status: "authenticated"; user: AdminUser; passwordExpired: boolean }
    | { status: "2fa_setup"; challengeToken: string; method: string }
    | { status: "2fa_verify"; challengeToken: string; method: string };

/** Shape persisted by both the normal login and the 2FA-verify result. */
export interface AuthSessionData {
    token: string;
    exp: number;
    user: CompanyAdminUser;
    password_expired?: boolean;
}

interface AuthContextValue {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    passwordExpired: boolean;
    login: (email: string, password: string) => Promise<LoginOutcome>;
    /** Finalize a session from a 2FA-verify result; returns whether the password is expired. */
    completeAuth: (data: AuthSessionData) => boolean;
    /** Clear the expired flag after a forced password change succeeds. */
    clearPasswordExpired: () => void;
    logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [passwordExpired, setPasswordExpired] = useState(false);

    // Revalidate session on mount / page reload via GET /company-admin/auth/me
    const getCurrentUser = useCallback(async () => {
        const token = getAuthCookie();
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await api.get("/company-admin/auth/me");
            const d = res.data.data;
            setUser(buildAdminUser(d));
            setPasswordExpired(d.password_expired === true);
        } catch {
            removeAuthCookie();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void getCurrentUser();
    }, [getCurrentUser]);

    // Persist a fully-authenticated session (normal login or 2FA verify).
    const finalizeSession = useCallback((d: AuthSessionData): boolean => {
        setAuthCookie(d.token, d.exp);
        setUser(buildAdminUser(d.user));
        const expired = d.password_expired === true;
        setPasswordExpired(expired);
        return expired;
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<LoginOutcome> => {
        const res = await api.post("/company-admin/auth/login", { email, password });
        const d = res.data.data;
        if (d.two_factor_setup_required === true) {
            return { status: "2fa_setup", challengeToken: d.challenge_token, method: d.two_factor_method };
        }
        if (d.two_factor_required === true) {
            return { status: "2fa_verify", challengeToken: d.challenge_token, method: d.two_factor_method };
        }
        const expired = finalizeSession(d);
        return { status: "authenticated", user: buildAdminUser(d.user), passwordExpired: expired };
    }, [finalizeSession]);

    const completeAuth = useCallback((d: AuthSessionData): boolean => finalizeSession(d), [finalizeSession]);

    const clearPasswordExpired = useCallback(() => setPasswordExpired(false), []);

    const logout = useCallback(async () => {
        try {
            await api.post("/company-admin/auth/logout");
        } catch {
            // ignore logout failure
        }
        removeAuthCookie();
        setUser(null);
        setPasswordExpired(false);
        queryclient.clear();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                passwordExpired,
                login,
                completeAuth,
                clearPasswordExpired,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
};

// ─── Helpers ─────────────────────────────────────────────────

function buildAdminUser(d: CompanyAdminUser): AdminUser {
    return {
        id: d.id as number,
        name: (d.name as string) ?? "",
        email: (d.email as string) ?? "",
        role: (d.role as AdminRole) ?? "support_admin",
        status: (d.status as string) ?? "active",
        lastLogin: (d.lastLogin as string) ?? "",
        createdAt: (d.createdAt as string) ?? "",
        permissions: (d.permissions as string[]) ?? [],
    };
}
