import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import AddExpenseModal from "@/components/Expense/ExpenseModal";
import { ConfirmationProvider } from "@/components/ui/confirmation-dialog";
import { PageContainer } from "@/components/ui/foundation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmationProvider>
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <Sidebar />

        <main className="min-h-screen w-full overflow-x-hidden md:ml-60 md:w-[calc(100%-15rem)]">
          <Navbar />

          <AddExpenseModal />

          <div className="w-full min-w-0 overflow-x-hidden px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 md:px-6 md:pb-8 lg:px-8">
            <PageContainer>{children}</PageContainer>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </ConfirmationProvider>
  );
}
