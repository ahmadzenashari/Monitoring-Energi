"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Header() {
  const [userName, setUserName] = useState("Memuat...");
  const [userRole, setUserRole] = useState("Memuat...");
  const [userInitial, setUserInitial] = useState("-");

  // ==========================================
  // DETEKSI AKUN & ROLE DARI FIRESTORE
  // ==========================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let name = user.displayName || user.email?.split("@")[0] || "Pengguna";
        let role = "Memuat...";

        try {
          const q = query(collection(db, "Users"), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            name = userData.name || name;
            role = userData.role || "Pengguna"; 
          } else {
            role = "Pengguna";
          }
        } catch (error) {
          console.error("Gagal mengambil data dari Firestore:", error);
          role = "Pengguna";
        }

        setUserName(name);
        setUserRole(role);
        setUserInitial(name.charAt(0).toUpperCase());
      } else {
        setUserName("Belum Login");
        setUserRole("-");
        setUserInitial("?");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-end shadow-lg px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-blue-900/50">
      
      {/* ========================================== */}
      {/* ANIMASI BACKGROUND & STYLING               */}
      {/* ========================================== */}
      <style>{`
        @keyframes headerGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-header {
          background: linear-gradient(-45deg, #0f172a, #1e3a8a, #1e293b, #0f172a);
          background-size: 300% 300%;
          animation: headerGlow 12s ease infinite;
        }
      `}</style>

      {/* Latar Belakang Gradien Bergerak */}
      <div className="absolute inset-0 z-0 animate-header opacity-95"></div>
      
      {/* Aksen Garis Cahaya di Bawah Header */}
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40"></div>

      {/* ========================================== */}
      {/* KONTEN HEADER (Berada di atas background)    */}
      {/* ========================================== */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-6">
        
        {/* Kolom Pencarian Transparan (Glassmorphism) */}
        <div className="hidden sm:flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white/20 transition-all backdrop-blur-md">
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Cari sesuatu..." 
            className="bg-transparent border-none outline-none text-sm text-white ml-2 w-48 placeholder:text-slate-300"
          />
        </div>

        {/* Garis Pemisah Vertikal Transparan */}
        <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

        {/* Tombol Profil Pengguna Dinamis */}
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400 bg-blue-900/60 text-sm font-bold text-blue-100 uppercase backdrop-blur-sm shadow-inner">
            {userInitial}
          </div>
          <div className="hidden sm:block text-white">
            <p className="text-sm font-bold leading-tight truncate max-w-[150px] capitalize">
              {userName}
            </p>
            <p className="text-xs font-medium text-blue-300 capitalize">
              {userRole}
            </p>
          </div>
          <svg className="hidden h-4 w-4 text-blue-300 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

      </div>
    </header>
  );
}