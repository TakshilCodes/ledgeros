import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import AddExpenseModal from "@/components/Expense/AddExpenseModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />

      <main className="ml-22 min-h-screen md:ml-65">
        <Navbar />

        <AddExpenseModal />

        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}