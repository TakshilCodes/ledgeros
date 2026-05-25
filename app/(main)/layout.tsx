import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import AddExpenseModal from "@/components/Expense/ExpenseModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#010409] text-white">
      <Sidebar />

      <main className="min-h-screen w-full overflow-x-hidden md:ml-65 md:w-[calc(100%-16.25rem)]">
        <Navbar />

        <AddExpenseModal />

        <div className="w-full min-w-0 overflow-x-hidden px-4 pb-24 pt-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}