import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import { MobileSidebarProvider } from "../context/MobileSidebarContext";
import FooterSection from "../components/sections/FooterSection";

const AdminLayout = () => {
    return (
        <ProtectedRoute>
            <MobileSidebarProvider>
                <div className="min-h-screen bg-background-primary">
                    <AdminSidebar />
                    <main className="lg:ml-64 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 max-w-7xl">
                        <AdminHeader />
                        <Outlet />
                        <FooterSection />
                    </main>
                </div>
            </MobileSidebarProvider>
        </ProtectedRoute>
    );
};

export default AdminLayout;
