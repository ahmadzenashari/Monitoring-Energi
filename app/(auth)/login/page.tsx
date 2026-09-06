"use client";

import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State untuk loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset error sebelumnya
    setError("");

    // Cegah tombol ditekan berkali-kali
    setLoading(true);

    try {
      // Login menggunakan Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);

      console.log("Login berhasil:", email);

      // Jika login berhasil, arahkan ke dashboard
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login gagal:", error);

      // Ambil kode error Firebase
      const firebaseError = error as { code?: string };

      switch (firebaseError.code) {
        case "auth/invalid-credential":
          setError("Email atau password yang Anda masukkan salah.");
          break;

        case "auth/user-not-found":
          setError("Akun dengan email tersebut tidak ditemukan.");
          break;

        case "auth/wrong-password":
          setError("Password yang Anda masukkan salah.");
          break;

        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;

        case "auth/user-disabled":
          setError("Akun Anda telah dinonaktifkan.");
          break;

        case "auth/too-many-requests":
          setError(
            "Terlalu banyak percobaan login. Silakan coba lagi beberapa saat."
          );
          break;

        default:
          setError("Login gagal. Silakan periksa email dan password Anda.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Menggunakan bg-slate-50 agar selaras dengan background dashboard
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6 sm:px-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="p-5 sm:p-8">
          
          <div className="mb-7 text-center sm:mb-8">
            <div className="mb-4 flex justify-center">
              {/* Ikon menggunakan warna Biru Navy khas PT IJS */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-800 shadow-lg shadow-blue-800/30">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Monitoring Energi
            </h1>

            <p className="mt-1 text-sm font-semibold tracking-wide text-blue-800">
              PT. INDOMULTI JAYASTEEL
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Silakan masuk menggunakan kredensial Anda
            </p>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Alamat Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@indomultijayasteel.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-700 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Ingat saya & Lupa password */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                />

                <span className="ml-2 text-sm font-medium text-slate-600">
                  Ingat saya
                </span>
              </label>

              <button
                type="button"
                disabled={loading}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Lupa password?
              </button>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-800 px-4 py-3.5 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
          
        </div>
      </div>
    </main>
  );
}