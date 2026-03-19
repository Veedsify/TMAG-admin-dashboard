import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-background-primary flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col lg:ml-64">
                <AdminHeader />
                <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
