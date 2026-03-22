import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import MobilePreviewPanel from "@/components/MobilePreviewPanel";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl page-enter">
          <Outlet />
        </div>
      </main>
      <MobilePreviewPanel />
    </div>
  );
};

export default AdminLayout;
