import Navbar from "@/component/navbar";
import Sidebar from "@/component/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />

      <main className="ml-[88px] min-h-screen md:ml-65">
        <Navbar />

        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}