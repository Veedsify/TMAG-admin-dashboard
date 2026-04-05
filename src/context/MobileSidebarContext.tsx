import { createContext, useContext, useState, type ReactNode } from "react";

type MobileSidebarContextValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
};

const MobileSidebarContext = createContext<MobileSidebarContextValue | null>(null);

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen((o) => !o);
    return (
        <MobileSidebarContext.Provider value={{ open, setOpen, toggle }}>
            {children}
        </MobileSidebarContext.Provider>
    );
}

export function useMobileSidebar() {
    const ctx = useContext(MobileSidebarContext);
    if (!ctx) {
        throw new Error("useMobileSidebar must be used within MobileSidebarProvider");
    }
    return ctx;
}
