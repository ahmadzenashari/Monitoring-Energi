"use client";

import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Memantau status login Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User sudah login
        setIsAuthenticated(true);
      } else {
        // User belum login
        setIsAuthenticated(false);
        router.replace("/login");
      }

      setCheckingAuth(false);
    });

    // Bersihkan listener ketika component dilepas
    return () => unsubscribe();
  }, [router]);

  // Saat Firebase masih mengecek status login
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />

          <p className="text-sm font-medium text-slate-500">
            Memeriksa autentikasi...
          </p>
        </div>
      </div>
    );
  }

  // Jika belum login, jangan tampilkan halaman
  if (!isAuthenticated) {
    return null;
  }

  // Jika sudah login, tampilkan halaman
  return <>{children}</>;
}
