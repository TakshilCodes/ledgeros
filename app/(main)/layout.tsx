import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import AddExpenseModal from "@/components/Expense/ExpenseModal";
import { PageContainer } from "@/components/ui/foundation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Sidebar />

      <main className="min-h-screen w-full overflow-x-hidden md:ml-60 md:w-[calc(100%-15rem)]">
        <Navbar />

        <AddExpenseModal />

        <div className="w-full min-w-0 overflow-x-hidden px-4 pb-20 pt-5 sm:px-5 md:px-6 md:pb-8 lg:px-8">
          <PageContainer>{children}</PageContainer>
        </div>
      </main>
    </div>
  );
}