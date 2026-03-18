import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { LucideLoader2 } from "lucide-react";

// Layouts
import AdminLayout from "../layouts/adminlayout";
import AuthLayout from "../layouts/authlayouts";

// Auth pages (eager load)
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import ForgotPassword from "../pages/auth/forgot-password";
import ResetPassword from "../pages/auth/reset-password";

// Admin pages (lazy load)
const Dashboard = lazy(() => import("../pages/admin/dashboard"));
const CompanyProfile = lazy(() => import("../pages/admin/company/profile"));
const TeamMembers = lazy(() => import("../pages/admin/team/members"));
const InviteMembers = lazy(() => import("../pages/admin/team/invite"));
const Credits = lazy(() => import("../pages/admin/credits/overview"));
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
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
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
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password", element: <ResetPassword /> },
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
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
