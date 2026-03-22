import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimateIn from "../../components/animations/AnimateIn";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/admin");
        } catch (err: unknown) {
            const errData = (err as { response?: { data?: { error?: string; message?: string }; status?: number } })?.response;
            const msg = errData?.data?.message ?? "Invalid credentials or insufficient permissions";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimateIn type="fade">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-lg bg-darkest flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TM</span>
                </div>
                <div>
                    <p className="text-heading text-sm font-semibold leading-tight">TMAG</p>
                    <p className="text-muted text-[10px] leading-tight">Admin Portal</p>
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Admin Sign In
            </h1>
            <p className="text-sm text-body mb-8">
                Access the admin dashboard to manage the platform.
            </p>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <p className="text-xs text-muted text-center mt-8">
                Only SuperAdmin and Administrator accounts can access this portal.
            </p>
        </AnimateIn>
    );
};

export default Login;
