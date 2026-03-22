import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../layouts/adminlayout";
import AuthLayout from "../layouts/authlayouts";

// Auth pages (eager load)
import Login from "../pages/auth/login";

// Admin pages (lazy load)
const Dashboard = lazy(() => import("../pages/admin/dashboard"));
const CompanyProfile = lazy(() => import("../pages/admin/company/profile"));
const TeamMembers = lazy(() => import("../pages/admin/team/members"));
const InviteMembers = lazy(() => import("../pages/admin/team/invite"));
const Credits = lazy(() => import("../pages/admin/credits/overview"));
const PaymentCallback = lazy(() => import("../pages/admin/credits/callback"));
const Invoices = lazy(() => import("../pages/admin/credits/invoices"));
const TravelPlans = lazy(() => import("../pages/admin/plans/list"));
const PlanDetails = lazy(() => import("../pages/admin/plans/details"));
const CreatePlan = lazy(() => import("../pages/admin/plans/create"));
const TravelRequests = lazy(() => import("../pages/admin/requests/list"));
const Reports = lazy(() => import("../pages/admin/reports/overview"));
const OnboardingStatus = lazy(() => import("../pages/admin/team/onboarding-status"));
const Settings = lazy(() => import("../pages/admin/settings/general"));
const AuditLog = lazy(() => import("../pages/admin/audit/log"));
const ApiKeys = lazy(() => import("../pages/admin/api-keys/manage"));
const DataExport = lazy(() => import("../pages/admin/settings/data-export"));

const LoadingFallback = () => (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-darkest flex items-center justify-center">
                <span className="text-white font-bold">TM</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
        </div>
    </div>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/admin" replace />,
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { index: true, element: <Navigate to="/auth/login" replace /> },
            { path: "login", element: <Login /> },
        ],
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Dashboard />
                    </Suspense>
                ),
            },
            {
                path: "company",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <CompanyProfile />
                    </Suspense>
                ),
            },
            {
                path: "team",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <TeamMembers />
                    </Suspense>
                ),
            },
            {
                path: "team/invite",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <InviteMembers />
                    </Suspense>
                ),
            },
            {
                path: "team/onboarding",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <OnboardingStatus />
                    </Suspense>
                ),
            },
            {
                path: "credits",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Credits />
                    </Suspense>
                ),
            },
            {
                path: "credits/callback",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PaymentCallback />
                    </Suspense>
                ),
            },
            {
                path: "credits/invoices",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Invoices />
                    </Suspense>
                ),
            },
            {
                path: "plans",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <TravelPlans />
                    </Suspense>
                ),
            },
            {
                path: "plans/create",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <CreatePlan />
                    </Suspense>
                ),
            },
            {
                path: "plans/:id",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <PlanDetails />
                    </Suspense>
                ),
            },
            {
                path: "requests",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <TravelRequests />
                    </Suspense>
                ),
            },
            {
                path: "reports",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Reports />
                    </Suspense>
                ),
            },
            {
                path: "audit",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <AuditLog />
                    </Suspense>
                ),
            },
            {
                path: "api-keys",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <ApiKeys />
                    </Suspense>
                ),
            },
            {
                path: "settings",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <Settings />
                    </Suspense>
                ),
            },
            {
                path: "settings/export",
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <DataExport />
                    </Suspense>
                ),
            },
        ],
    },
    // Catch-all redirect
    {
        path: "*",
        element: <Navigate to="/admin" replace />,
    },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
