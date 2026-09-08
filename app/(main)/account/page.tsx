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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Operator",
    status: "Aktif",
  });

  // ==========================================
  // AMBIL DATA USERS
  // ==========================================

const fetchAccounts = async () => {
  try {
    setLoading(true);

    console.log("Mengambil data Users dari Firestore...");

    const snapshot = await getDocs(
      collection(db, "Users")
    );

    console.log("Jumlah dokumen Users:", snapshot.size);

    const users: Account[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      console.log("Data user:", doc.id, data);

      return {
        id: doc.id,
        name: data.name || "-",
        email: data.email || "-",
        role: data.role || "-",
        status: data.status || "Aktif",
      };
    });

    console.log("Users hasil mapping:", users);

    setAccounts(users);
  } catch (error) {
    console.error(
      "Gagal mengambil data Users:",
      error
    );
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
  // BUKA MODAL TAMBAH AKUN
  // ==========================================

  const handleAddClick = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Operator",
      status: "Aktif",
    });

    setIsModalOpen(true);
  };

  // ==========================================
  // SIMPAN AKUN
  // ==========================================

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      // ------------------------------------------
      // CEK USER YANG SEDANG LOGIN
      // ------------------------------------------

      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Anda belum login.");
        return;
      }

      // ------------------------------------------
      // AMBIL ID TOKEN
      // ------------------------------------------

      const idToken = await currentUser.getIdToken(true);

      console.log(
        "Mengirim request tambah akun..."
      );

      // ------------------------------------------
      // REQUEST KE API
      // ------------------------------------------

      const response = await fetch("/api/users", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },

        body: JSON.stringify(formData),
      });

      // ------------------------------------------
      // BACA RESPONSE DENGAN AMAN
      // ------------------------------------------

      const responseText = await response.text();

      console.log(
        "API Status:",
        response.status
      );

      console.log(
        "API Response:",
        responseText
      );

      let result: any = null;

      // Jika response tidak kosong, coba parse JSON
      if (responseText.trim() !== "") {
        try {
          result = JSON.parse(responseText);
        } catch (jsonError) {
          console.error(
            "Response API bukan JSON:",
            jsonError
          );

          throw new Error(
            `Server mengembalikan response tidak valid. Status: ${response.status}`
          );
        }
      }

      // ------------------------------------------
      // CEK RESPONSE API
      // ------------------------------------------

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Gagal membuat akun. Status: ${response.status}`
        );
      }

      // ------------------------------------------
      // AKUN BERHASIL DIBUAT
      // ------------------------------------------

      alert(
        result?.message ||
          "Akun berhasil dibuat."
      );

      // ------------------------------------------
      // TUTUP MODAL
      // ------------------------------------------

      setIsModalOpen(false);

      // ------------------------------------------
      // RESET FORM
      // ------------------------------------------

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Operator",
        status: "Aktif",
      });

      // ------------------------------------------
      // REFRESH DATA USERS
      // ------------------------------------------

      await fetchAccounts();

    } catch (error: any) {
      console.error(
        "Error saat membuat akun:",
        error
      );

      alert(
        error?.message ||
          "Terjadi kesalahan saat membuat akun."
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // TAMPILAN
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Manajemen Akun
            </h2>

            <p className="text-slate-500 mt-1">
              Kelola pengguna yang memiliki akses
              ke sistem Monitoring Energi.
            </p>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>

            Tambah Akun
          </button>

        </div>

        {/* ========================= */}
        {/* TABLE */}
        {/* ========================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>

                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">

                  <th className="px-6 py-4 font-semibold">
                    Nama Pengguna
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Email
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Peran
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (

                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Memuat data akun...
                    </td>
                  </tr>

                ) : accounts.length === 0 ? (

                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Belum ada data akun.
                    </td>
                  </tr>

                ) : (

                  accounts.map((acc) => (

                    <tr
                      key={acc.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >

                      {/* NAME */}

                      <td className="px-6 py-4">

                        <div className="font-medium text-slate-900">
                          {acc.name}
                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4 text-slate-500">
                        {acc.email}
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            acc.role.toLowerCase() ===
                            "administrator"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : acc.role.toLowerCase() ===
                                "teknisi"
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}
                        >
                          {acc.role}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            acc.status.toLowerCase() ===
                            "aktif"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              acc.status.toLowerCase() ===
                              "aktif"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />

                          {acc.status}

                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

      {/* ========================= */}
      {/* MODAL TAMBAH AKUN */}
      {/* ========================= */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">

            {/* HEADER MODAL */}

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Tambah Akun Baru
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Buat akun pengguna baru
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSave}
              className="p-6 space-y-4"
            >

              {/* NAMA */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="email@ijs.co.id"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* ROLE & STATUS */}

              <div className="grid grid-cols-2 gap-4">

                {/* ROLE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Peran
                  </label>

                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="Administrator">
                      Administrator
                    </option>

                    <option value="Operator">
                      Operator
                    </option>

                    <option value="Teknisi">
                      Teknisi
                    </option>

                  </select>

                </div>

                {/* STATUS */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Nonaktif">
                      Nonaktif
                    </option>

                  </select>

                </div>

              </div>

              {/* BUTTON */}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : "Simpan Akun"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}