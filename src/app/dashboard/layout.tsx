import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cf-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-5">{children}</main>
      </div>
    </div>
  );
}
