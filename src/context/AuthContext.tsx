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

interface AuthContextValue {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<AdminUser>;
    logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const login = useCallback(async (email: string, password: string): Promise<AdminUser> => {
        const res = await api.post("/company-admin/auth/login", { email, password });
        const d = res.data.data;
        setAuthCookie(d.token, d.exp);

        const adminUser = buildAdminUser(d.user);
        setUser(adminUser);
        return adminUser;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/company-admin/auth/logout");
        } catch {
            // ignore logout failure
        }
        removeAuthCookie();
        setUser(null);
        queryclient.clear();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                login,
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

function buildAdminUser(d: Record<string, unknown>): AdminUser {
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
