import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./routes/route";
import { AuthProvider } from "./context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryclient } from "./lib/queryclient";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryclient}>
            <AuthProvider>
                <AppRouter />
                <Toaster position="top-right" />
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
);
