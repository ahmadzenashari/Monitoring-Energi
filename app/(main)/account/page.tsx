"use client";

import { useState } from "react";

// Tipe data untuk TypeScript
type Account = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function AccountManagementPage() {
  // 1. Data Dummy Awal (Read)
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: "Admin Utama", email: "admin@ijs.co.id", role: "Administrator", status: "Aktif" },
    { id: 2, name: "Budi Santoso", email: "budi.op@ijs.co.id", role: "Operator", status: "Aktif" },
    { id: 3, name: "Siti Teknisi", email: "siti.tek@ijs.co.id", role: "Teknisi", status: "Nonaktif" },
  ]);

  // State untuk mengontrol Modal (Form)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // State untuk input form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Operator",
    status: "Aktif",
  });

  // Fungsi untuk membuka form tambah data
  const handleAddClick = () => {
    setFormData({ name: "", email: "", role: "Operator", status: "Aktif" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka form edit data (Update)
  const handleEditClick = (acc: Account) => {
    setFormData({ name: acc.name, email: acc.email, role: acc.role, status: acc.status });
    setEditingId(acc.id);
    setIsModalOpen(true);
  };

  // Fungsi untuk menghapus data (Delete)
  const handleDeleteClick = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
      setAccounts(accounts.filter((acc) => acc.id !== id));
    }
  };

  // Fungsi untuk menyimpan data (Create & Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update data yang ada
      setAccounts(
        accounts.map((acc) =>
          acc.id === editingId ? { ...acc, ...formData } : acc
        )
      );
    } else {
      // Tambah data baru (Create)
      const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
      setAccounts([...accounts, { id: newId, ...formData }]);
    }
    setIsModalOpen(false); // Tutup modal setelah simpan
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300 relative">
      
      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Manajemen Akun</h2>
            <p className="text-slate-500 mt-1">
              Kelola daftar pengguna yang memiliki akses ke sistem Monitoring Energi.
            </p>
          </div>
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Tambah Akun
          </button>
        </div>

        {/* Tabel Data (Read) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Nama Pengguna</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Peran</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Belum ada data akun yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{acc.name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{acc.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          acc.role === "Administrator" ? "bg-purple-50 text-purple-700 border-purple-100" :
                          acc.role === "Teknisi" ? "bg-orange-50 text-orange-700 border-orange-100" :
                          "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          acc.status === "Aktif" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${acc.status === "Aktif" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleEditClick(acc)}
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(acc.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modal / Pop-up Form CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "Edit Akun" : "Tambah Akun Baru"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Masukkan nama pengguna"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="email@ijs.co.id"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Peran</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Operator">Operator</option>
                    <option value="Teknisi">Teknisi</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}