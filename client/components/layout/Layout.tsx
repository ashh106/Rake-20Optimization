import { Outlet, useLocation, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentPath={location.pathname} />
        <main className="flex-1 px-6 pb-6 pt-4 container mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
