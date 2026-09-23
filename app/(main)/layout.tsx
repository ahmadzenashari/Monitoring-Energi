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
      {/* 1. Ubah pembungkus utama menjadi flex container */}
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        {/* 2. Hapus ml-64, ganti dengan flex-1 w-full agar meregang dinamis */}
        <div className="flex-1 flex flex-col w-full min-w-0 transition-all duration-300">
          <Header />

          {/* Hapus p-6 dari sini jika DashboardPage sudah punya padding (px-4 py-8) sendiri agar tidak double */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}