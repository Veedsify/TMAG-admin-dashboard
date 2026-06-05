import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    /** Optional supporting text rendered under the title and linked via aria-describedby. */
    description?: string;
    children: ReactNode;
}

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog: focus is trapped while open, restored to the
 * previously-focused element on close, Escape closes, and the backdrop is inert
 * to assistive tech. Labelled/described via ARIA.
 */
export default function Modal({ open, onClose, title, description, children }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const descId = useId();

    useEffect(() => {
        if (!open) return;
        previousFocus.current = document.activeElement as HTMLElement | null;
        const node = dialogRef.current;
        // Focus the first focusable element (fall back to the dialog itself).
        const firstFocusable = node?.querySelector<HTMLElement>(FOCUSABLE);
        (firstFocusable ?? node)?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
                return;
            }
            if (e.key !== "Tab" || !node) return;
            const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("keydown", handleKey);
            previousFocus.current?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                className="relative w-full max-w-md rounded-3xl border border-border-light/60 bg-white p-6 shadow-[0_8px_28px_-12px_rgba(10,20,18,0.25)] outline-none"
            >
                <h2 id={titleId} className="text-base font-semibold text-heading">
                    {title}
                </h2>
                {description && (
                    <p id={descId} className="mt-1 text-sm text-muted">
                        {description}
                    </p>
                )}
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}
