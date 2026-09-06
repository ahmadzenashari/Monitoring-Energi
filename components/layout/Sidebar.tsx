"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(true);

  const menu = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ) 
    },
    { 
      name: "Account", 
      path: "/account", 
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      ) 
    },
  ];

  const logout = () => {
    router.push("/login");
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-slate-50 transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Tombol Toggle Collapse */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-blue-600 cursor-pointer"
      >
        <svg 
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header Logo */}
      <div className={`flex h-20 items-center border-b border-slate-200/60 ${isOpen ? "px-6 gap-3" : "px-0 justify-center"}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
          <svg className="h-5 w-5 fill-none stroke-white" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
          </svg>
        </div>
        
        <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
          <h1 className="text-sm font-bold text-slate-900 tracking-wide">Monitoring Energi</h1>
          <p className="text-xs font-medium text-slate-500">PT IJS</p>
        </div>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 overflow-x-hidden">
        <p className={`mb-4 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
          Menu Utama
        </p>
        
        <div className="space-y-1.5">
          {menu.map((item) => {
            const active = pathname === item.path;
            return (
              <button 
                key={item.path} 
                onClick={() => router.push(item.path)} 
                title={!isOpen ? item.name : ""}
                className={`group flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                  isOpen ? "w-full px-3 gap-3" : "w-12 px-0 justify-center mx-auto gap-0"
                } ${
                  active 
                    ? "bg-blue-100/50 text-blue-700 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <span className={`h-5 w-5 shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                
                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
                  {item.name}
                </span>
                
                {active && isOpen && (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Logout */}
      <div className="border-t border-slate-200/60 p-4">
        <button 
          onClick={logout} 
          title={!isOpen ? "Keluar Sistem" : ""}
          className={`group flex items-center rounded-xl py-3 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${
            isOpen ? "w-full px-3 gap-3" : "w-12 px-0 justify-center mx-auto gap-0"
          }`}
        >
          <svg className="h-5 w-5 shrink-0 fill-none stroke-current transition-transform duration-200 group-hover:-translate-x-1" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          
          <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
            Keluar Sistem
          </span>
        </button>
      </div>
      
    </aside>
  );
}