import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import AuthGuard from "../../components/auth/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Sidebar />

        <div className="ml-64">
          <Header />

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}