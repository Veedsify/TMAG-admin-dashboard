import { LucidePartyPopper, LucideTag, LucideSparkles } from "lucide-react";
import { useLaunchDiscount } from "../api";

interface LaunchDiscountBannerProps {
    /** `"page"` is a full-width strip; `"inline"` is a rounded pill. */
    variant?: "page" | "inline";
    className?: string;
}

const cx = (...parts: Array<string | false | undefined | null>) =>
    parts.filter(Boolean).join(" ");

const LaunchDiscountBanner = ({
    variant = "page",
    className,
}: LaunchDiscountBannerProps) => {
    const { data } = useLaunchDiscount();
    if (!data || !data.active) return null;

    const headline =
        data.label && data.label.trim().length > 0
            ? data.label
            : `Launch promo — ${data.percentage}% off`;

    if (variant === "inline") {
        return (
            <div
                role="status"
                className={cx(
                    "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-linear-to-r from-emerald-50 via-emerald-100/80 to-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800",
                    className,
                )}
            >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <LucideTag className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />
                </span>
                <span className="leading-none">
                    {headline}{" "}
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-200/60 px-1.5 py-0.5 font-bold text-emerald-700">
                        {data.percentage}% off
                    </span>
                </span>
            </div>
        );
    }

    const gradients = [
        "from-emerald-600 via-emerald-700 to-teal-600",
        "from-teal-600 via-emerald-600 to-cyan-600",
    ];
    const gradient = gradients[0];

    return (
        <div
            role="status"
            aria-label={`${headline}. ${data.percentage}% off applied automatically.`}
            className={cx(
                "relative isolate overflow-hidden rounded-2xl bg-linear-to-r px-5 py-4 text-white",
                gradient,
                className,
            )}
        >
            {/* Decorative blobs */}
            <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5 blur-xl"
                aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <LucidePartyPopper className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-sm font-bold tracking-wide sm:text-base">{headline}</p>
                        <p className="text-xs font-medium text-white/80">
                            Limited-time launch offer
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white backdrop-blur-sm">
                        <LucideSparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {data.percentage}% off
                    </span>
                    <span className="hidden text-xs font-medium text-white/70 sm:inline">
                        applied automatically
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LaunchDiscountBanner;
