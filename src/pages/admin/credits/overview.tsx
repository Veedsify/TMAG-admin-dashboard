import { Link } from "react-router-dom";
import { LucideCoins, LucidePlus, LucideFileText, LucideArrowRight, LucideLoader2 } from "lucide-react";
import { useMyCompanies, usePurchaseCredits, useCredits } from "../../../api/hooks";

const Credits = () => {
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: creditsData, isLoading } = useCredits(companyId ? { companyId, per_page: 10 } : undefined);
    const purchaseCredits = usePurchaseCredits();

    const totalCredits = company?.total_credits ?? 0;
    const usedCredits = company?.used_credits ?? 0;
    const remainingCredits = totalCredits - usedCredits;

    const transactions = creditsData?.data || [];

    const creditPackages = [
        { credits: 50, price: 450, popular: false },
        { credits: 100, price: 850, popular: true },
        { credits: 200, price: 1600, popular: false },
    ];

    const handlePurchase = (amount: number) => {
        if (!companyId) return;
        purchaseCredits.mutate({ id: companyId, data: { amount } });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-heading mb-2">Credits & Billing</h1>
                    <p className="text-sm text-muted">Manage your company's credit balance and billing</p>
                </div>
                <Link
                    to="/admin/credits/invoices"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-sm font-medium text-heading hover:border-accent/50 transition-colors"
                >
                    <LucideFileText className="w-4 h-4" />
                    View Invoices
                </Link>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Total Credits
                        </span>
                        <LucideCoins className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-4xl font-serif text-heading">{isLoading ? "-" : totalCredits}</p>
                </div>

                <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Used
                        </span>
                        <LucideCoins className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-4xl font-serif text-heading">{isLoading ? "-" : usedCredits}</p>
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                            Remaining
                        </span>
                        <LucideCoins className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-4xl font-serif text-accent">{isLoading ? "-" : remainingCredits}</p>
                </div>
            </div>

            {/* Purchase Credits */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">Purchase Credits</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {creditPackages.map((tier) => (
                        <div
                            key={tier.credits}
                            className={`relative p-6 rounded-xl border-2 transition-colors ${
                                tier.popular
                                    ? "border-accent bg-accent/5"
                                    : "border-border-light hover:border-accent/50"
                            }`}
                        >
                            {tier.popular && (
                                <span className="absolute -top-2 right-4 px-2 py-0.5 bg-accent text-white text-xs font-semibold rounded-full">
                                    Popular
                                </span>
                            )}
                            <div className="text-3xl font-serif text-heading mb-2">{tier.credits}</div>
                            <div className="text-sm text-muted mb-4">credits</div>
                            <div className="text-2xl font-semibold text-heading mb-4">${tier.price}</div>
                            <button 
                                onClick={() => handlePurchase(tier.credits)}
                                disabled={purchaseCredits.isPending}
                                className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {purchaseCredits.isPending ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <LucidePlus className="w-4 h-4" />}
                                Purchase
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light/50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-heading">Recent Transactions</h2>
                    <button className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
                        View All
                        <LucideArrowRight className="w-4 h-4" />
                    </button>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-background-primary border-b border-border-light/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-background-primary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-heading">{tx.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`text-sm font-semibold ${
                                                tx.amount > 0 ? "text-green-600" : "text-heading"
                                            }`}
                                        >
                                            {tx.amount > 0 ? "+" : ""}
                                            {tx.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted">
                                            {tx.reference || "Credit transaction"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-sm text-muted">No transactions yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Credits;
