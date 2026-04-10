import { LucideCheck, LucideArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import AnimateIn from "../animations/AnimateIn";
import StaggerGroup, { staggerItem } from "../animations/StaggerGroup";

const companyPlans = [
    {
        tier: "bronze",
        name: "Bronze",
        signupCredits: 100,
        employeeLimit: "1–100 employees",
        apiAccess: false,
        customSupport: false,
        multipleAdminAccounts: false,
        tenThousandPlusEmployees: false,
        description: "Great for small teams getting started with travel health planning.",
    },
    {
        tier: "silver",
        name: "Silver",
        signupCredits: 200,
        employeeLimit: "Up to 500 employees",
        apiAccess: true,
        customSupport: true,
        multipleAdminAccounts: true,
        tenThousandPlusEmployees: false,
        description: "For growing teams that need integrations and stronger admin controls.",
    },
    {
        tier: "gold",
        name: "Gold",
        signupCredits: 500,
        employeeLimit: "Up to 1,000 employees",
        apiAccess: true,
        customSupport: true,
        multipleAdminAccounts: true,
        tenThousandPlusEmployees: false,
        description: "For larger organizations with high travel volume and compliance demands.",
    },
    {
        tier: "diamond",
        name: "Diamond",
        signupCredits: 1000,
        employeeLimit: "Up to 100,000 employees",
        apiAccess: true,
        customSupport: true,
        multipleAdminAccounts: true,
        tenThousandPlusEmployees: true,
        description: "Enterprise scale with highest credits, full API access, and priority support.",
    },
];

const PricingSection = () => {
    return (
        <div className="bg-background-secondary">
            <section className="px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
                <AnimateIn className="text-center mb-14">
                    <span className="inline-block text-sm text-muted bg-button-secondary font-semibold rounded-xl px-4 py-1.5 mb-6">
                        Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-heading leading-[1.1] font-serif">
                        Simple, <span className="italic">transparent</span>{" "}
                        pricing.
                    </h2>
                    <p className="text-sm text-muted mt-4 max-w-md mx-auto leading-relaxed">
                        No hidden fees, no surprise charges. Pick the company plan
                        that matches your team size.
                    </p>
                </AnimateIn>

                <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" stagger={0.15}>
                    {companyPlans.map((plan) => (
                        <motion.div
                            variants={staggerItem}
                            key={plan.tier}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden ${
                                plan.tier === "diamond" ? "" : "bg-background-primary"
                            }`}
                        >
                            {plan.tier === "diamond" && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #2a7a6a 0%, #1a6a7a 30%, #187080 55%, #1a6878 80%, #246858 100%)",
                                    }}
                                />
                            )}
                            {plan.tier === "diamond" && (
                                <span className="absolute top-6 right-6 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full">
                                    Best for API teams
                                </span>
                            )}

                            <div className="relative z-10">
                                <h3
                                    className={`text-lg font-semibold mb-1 ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}
                                >
                                    {plan.name}
                                </h3>
                                <p
                                    className={`text-sm mb-6 ${plan.tier === "diamond" ? "text-white/60" : "text-body"}`}
                                >
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span
                                        className={`text-4xl font-serif ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}
                                    >
                                        {plan.signupCredits}
                                    </span>
                                    <span className={`text-sm ${plan.tier === "diamond" ? "text-white/60" : "text-body"}`}>
                                        signup credits
                                    </span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {[
                                        `Employee limit: ${plan.employeeLimit}`,
                                        `API access: ${plan.apiAccess ? "Included" : "Not included"}`,
                                        `Custom support: ${plan.customSupport ? "Included" : "Not included"}`,
                                        `Multiple admins: ${plan.multipleAdminAccounts ? "Included" : "Not included"}`,
                                    ].map((f) => (
                                        <li
                                            key={f}
                                            className={`flex items-start gap-3 text-sm ${plan.tier === "diamond" ? "text-white" : "text-heading"}`}
                                        >
                                            <LucideCheck
                                                className={`w-4 h-4 mt-0.5 shrink-0 ${plan.tier === "diamond" ? "text-white/60" : "text-accent"}`}
                                            />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {plan.tier === "diamond" ? (
                                <Button
                                    variant="primary"
                                    className="relative z-10 self-stretch bg-white !text-dark hover:bg-white/90 text-center justify-center flex"
                                >
                                    Talk to sales
                                </Button>
                            ) : (
                                <Button variant="secondary" icon={<LucideArrowRight />} className="self-start relative z-10">
                                    View plans
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </StaggerGroup>
            </section>
        </div>
    );
};

export default PricingSection;
