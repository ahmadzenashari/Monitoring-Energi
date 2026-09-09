"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

type Account = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function AccountManagementPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  // State untuk konfirmasi Hapus (Custom Confirm)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // State untuk Toast Notification (Pop-up auto-hide)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Operator",
    status: "Aktif",
  });

  // ==========================================
  // FUNGSI TOAST NOTIFICATION
  // ==========================================
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // ==========================================
  // AMBIL DATA USERS
  // ==========================================
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "Users"));
      const users: Account[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "-",
          email: data.email || "-",
          role: data.role || "-",
          status: data.status || "Aktif",
        };
      });
      setAccounts(users);
    } catch (error) {
      console.error("Gagal mengambil data Users:", error);
      showToast("Gagal mengambil data pengguna.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DATA SAAT HALAMAN DIBUKA
  // ==========================================
  useEffect(() => {
    fetchAccounts();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Operator",
      status: "Aktif",
    });
    setEditingId(null);
  };

  // ==========================================
  // BUKA MODAL TAMBAH & EDIT
  // ==========================================
  const handleAddClick = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (account: Account) => {
    setEditingId(account.id);
    setFormData({
      name: account.name,
      email: account.email,
      password: "",
      role: account.role,
      status: account.status,
    });
    setIsModalOpen(true);
  };

  // ==========================================
  // SIMPAN AKUN
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        showToast("Anda belum login.", "error");
        return;
      }

      const idToken = await currentUser.getIdToken(true);
      const isEdit = editingId !== null;

      const response = await fetch("/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(
          isEdit
            ? {
                id: editingId,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                status: formData.status,
              }
            : formData
        ),
      });

      const responseText = await response.text();
      let result: any = null;

      if (responseText.trim() !== "") {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(`Server mengembalikan response tidak valid. Status: ${response.status}`);
        }
      }

      if (!response.ok) {
        throw new Error(result?.message || `Gagal ${isEdit ? "mengubah" : "membuat"} akun.`);
      }

      showToast(result?.message || (isEdit ? "Akun berhasil diperbarui." : "Akun berhasil dibuat."), "success");
      setIsModalOpen(false);
      resetForm();
      await fetchAccounts();
    } catch (error: any) {
      console.error("Error saat menyimpan akun:", error);
      showToast(error?.message || "Terjadi kesalahan saat menyimpan akun.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // HAPUS AKUN
  // ==========================================
  const confirmDeleteClick = (account: Account) => {
    setAccountToDelete(account);
  };

  const proceedDelete = async () => {
    if (!accountToDelete) return;

    try {
      setSaving(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        showToast("Anda belum login.", "error");
        return;
      }

      if (currentUser.email === accountToDelete.email) {
        showToast("Akun yang sedang digunakan tidak dapat dihapus.", "error");
        return;
      }

      const idToken = await currentUser.getIdToken(true);
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          id: accountToDelete.id,
          email: accountToDelete.email,
        }),
      });

      const responseText = await response.text();
      let result: any = null;

      if (responseText.trim() !== "") {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(`Server mengembalikan response tidak valid.`);
        }
      }

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menghapus akun.");
      }

      showToast(result?.message || "Akun berhasil dihapus.", "success");
      await fetchAccounts();
    } catch (error: any) {
      console.error("Error saat menghapus akun:", error);
      showToast(error?.message || "Terjadi kesalahan saat menghapus akun.", "error");
    } finally {
      setSaving(false);
      setAccountToDelete(null);
    }
  };

  // ==========================================
  // TAMPILAN
  // ==========================================
  return (
    // overflow-hidden ditambahkan agar animasi blob tidak melebar keluar batas layar
    <div className="min-h-screen w-full flex-1 bg-slate-50 transition-all duration-300 relative overflow-hidden">
      
      {/* 🌟 CSS KEYFRAMES UNTUK ANIMASI BACKGROUND */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* 🌟 ELEMEN ANIMASI BACKGROUND (GLOWING ORBS) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[35rem] h-[35rem] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-lg border text-sm font-medium ${
            toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
              toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}>
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            {toast.message}
          </div>
        </div>
      )}

      {/* KONTEN UTAMA (Ditambahkan relative z-10 agar berada di atas animasi background) */}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Manajemen Akun</h2>
            <p className="text-slate-600 mt-1">
              Kelola pengguna yang memiliki akses ke sistem Monitoring Energi.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Akun
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200/60 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Nama Pengguna</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Peran</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
                      <p className="mt-2 text-slate-500 text-sm">Memuat data...</p>
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Belum ada data akun.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{acc.name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{acc.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          acc.role.toLowerCase() === "administrator"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : acc.role.toLowerCase() === "teknisi"
                            ? "bg-orange-50 text-orange-700 border-orange-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          acc.status.toLowerCase() === "aktif"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            acc.status.toLowerCase() === "aktif" ? "bg-emerald-500" : "bg-rose-500"
                          }`} />
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(acc)}
                            disabled={saving}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Edit akun"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.5-8.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 8.5-8.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDeleteClick(acc)}
                            disabled={saving}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Hapus akun"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                            </svg>
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

      {/* MODAL KONFIRMASI HAPUS (CUSTOM CONFIRM) */}
      {accountToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 mb-4">
              <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">"{accountToDelete.name}"</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={proceedDelete}
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Akun" : "Tambah Akun Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!saving) {
                    setIsModalOpen(false);
                    resetForm();
                  }
                }}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@indomultijayasteel.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required={!editingId}
                  minLength={editingId ? undefined : 6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Peran</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all appearance-none"
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all appearance-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      setIsModalOpen(false);
                      resetForm();
                    }
                  }}
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-60 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 shadow-md rounded-xl disabled:opacity-60 cursor-pointer transition-all"
                >
                  {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}