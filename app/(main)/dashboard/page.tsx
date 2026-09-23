"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi helper untuk memformat angka desimal
  const formatNumber = (num: any, decimals = 1) => {
    if (num === undefined || num === null) return "0.0";
    return Number(num).toFixed(decimals);
  };

  // Fungsi untuk mengambil data (manual update)
  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "latest", "PM01");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSensorData(docSnap.data());
      } else {
        console.warn("Dokumen PM01 tidak ditemukan.");
      }
    } catch (error) {
      console.error("Gagal mengambil data dari Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pengecekan status ESP32 (Aktif jika update terakhir < 1 menit)
  const checkEspStatus = () => {
    if (!sensorData?.timestamp) return false;
    
    let dataTimeMs = 0;
    if (sensorData.timestamp.toMillis) {
      dataTimeMs = sensorData.timestamp.toMillis();
    } else {
      dataTimeMs = new Date(sensorData.timestamp).getTime();
    }
      
    const nowMs = new Date().getTime();
    const diff = nowMs - dataTimeMs;
    
    return diff <= 60000; 
  };

  // Pengecekan status Mesin (Off jika tegangan < 50V DAN arus < 0.5A)
  const checkMachineStatus = () => {
    if (!sensorData) return false;
    
    const voltage = Number(sensorData.Uab) || 0;
    const current = Number(sensorData.Ia) || 0;
    
    if (voltage < 50 && current < 0.5) {
      return false; 
    }
    return true; 
  };

  const isEspActive = checkEspStatus();
  const isMachineOn = checkMachineStatus();

  useEffect(() => {
    fetchSensorData();
  }, []);

  return (
    <div className="min-h-screen w-full flex-1 bg-slate-50 transition-all duration-300 relative">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        
        {/* Header Sambutan */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Monitoring 3 Phase</h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              Pantau akumulasi kWh, konsumsi harian, serta arus dan tegangan tiap fasa secara real-time.
            </p>
          </div>
        </div>

        {/* Grid Kartu Indikator */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-8">
          
          {/* Kartu 1: Total Energi */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total KWH Meter</p>
              <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl text-lg">
                ⚡
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : formatNumber(sensorData?.energyKWh)} <span className="text-xl font-bold text-slate-400">kWh</span>
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-6">Akumulasi sejak awal pemasangan</p>
          </div>

          {/* Kartu 2: Konsumsi Harian */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Energi Hari Ini (Wh)</p>
              <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl text-lg">
                📈
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : formatNumber(sensorData?.energyWh, 4)} <span className="text-xl font-bold text-slate-400">Wh</span>
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-6">Berdasarkan siklus 24 jam</p>
          </div>

          {/* Kartu 3: Tegangan (Line-to-Line) */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Tegangan</p>
              <div className="w-10 h-10 flex items-center justify-center bg-purple-50 text-purple-500 rounded-xl text-lg">
                🔌
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-sm font-bold text-slate-700">Phase R-S</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {loading ? "..." : formatNumber(sensorData?.Uab)} <span className="text-xs text-slate-400">v</span>
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-sm font-bold text-slate-700">Phase S-T</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {loading ? "..." : formatNumber(sensorData?.Ubc)} <span className="text-xs text-slate-400">v</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                  <span className="text-sm font-bold text-slate-700">Phase T-R</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {loading ? "..." : formatNumber(sensorData?.Uca)} <span className="text-xs text-slate-400">v</span>
                </span>
              </div>
            </div>
          </div>

          {/* Kartu 4: Arus */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Arus (Ampere)</p>
              <div className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-500 rounded-xl text-lg">
                🔋
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-sm font-bold text-slate-700">Phase R</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {loading ? "..." : formatNumber(sensorData?.Ia)} <span className="text-xs text-slate-400">A</span>
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-sm font-bold text-slate-700">Phase S</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {loading ? "..." : formatNumber(sensorData?.Ib)} <span className="text-xs text-slate-400">A</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                  <span className="text-sm font-bold text-slate-700">Phase T</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">
                  {loading ? "..." : formatNumber(sensorData?.Ic)} <span className="text-xs text-slate-400">A</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bagian Grafik & Status */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
          
          <div className="xl:col-span-2 bg-white p-7 rounded-2xl shadow-sm border border-slate-100/60 transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Riwayat Konsumsi Energi Harian</h3>
                <p className="text-sm text-slate-500 mt-1">Pemantauan tren penggunaan listrik dalam rentang waktu tertentu.</p>
              </div>
            </div>
            
            <div className="w-full h-80 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center relative">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <span className="text-sm font-medium">Grafik akan dimuat di sini</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100/60 flex flex-col transition-all hover:shadow-md">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Status Perangkat & Database</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">Konektivitas sistem manual update.</p>
            </div>
            
            <div className="space-y-4 flex-1">
              
              {/* Status ESP32 */}
              <div className="flex items-center justify-between p-4.5 bg-slate-50 rounded-xl border border-slate-100/80">
                <div className="flex items-center gap-3.5">
                  <div className={`relative flex h-3 w-3`}>
                    {isEspActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isEspActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                  </div>
                  <span className="font-semibold text-slate-700">Node ESP32</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ${isEspActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {isEspActive ? "Online" : "Offline"}
                </span>
              </div>

              {/* Tipe Power Meter */}
              <div className="flex items-center justify-between p-4.5 bg-slate-50 rounded-xl border border-slate-100/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  <span className="font-semibold text-slate-700">Tipe Power Meter</span>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm bg-blue-100 text-blue-700">
                  ER200
                </span>
              </div>

              {/* Status Mesin */}
              <div className="flex items-center justify-between p-4.5 bg-slate-50 rounded-xl border border-slate-100/80">
                <div className="flex items-center gap-3.5">
                  <div className={`w-3 h-3 rounded-full ${isMachineOn ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-400"}`}></div>
                  <span className="font-semibold text-slate-700">Status Mesin</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ${isMachineOn ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {isMachineOn ? "Aktif" : "Off"}
                </span>
              </div>

            </div>
            
            {/* Tombol Update Manual */}
            <button 
              onClick={fetchSensorData}
              disabled={loading}
              className="w-full mt-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-sm cursor-pointer"
            >
              {loading ? "Mengambil Data..." : "Perbarui Data Sekarang"}
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}