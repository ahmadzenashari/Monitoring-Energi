export default function DashboardPage() {
  return (
    // Menggunakan bg-slate-50 agar SAMA PERSIS dengan warna latar sidebar
    <div className="min-h-screen bg-slate-50 transition-colors duration-300">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Sambutan */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Ikhtisar Energi Anda</h2>
          <p className="text-slate-500 mt-1">
            Pantau penggunaan listrik, daya, dan tegangan secara real-time.
          </p>
        </div>

        {/* Grid Kartu Indikator */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Energi (Hari Ini)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">14.5 <span className="text-lg text-slate-400">kWh</span></h3>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl">
                <span className="text-sky-500 text-xl">⚡</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-medium flex items-center gap-1">↑ 2.1%</span>
              <span className="text-slate-400 ml-2">dari kemarin</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Daya Aktif</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">1,240 <span className="text-lg text-slate-400">W</span></h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <span className="text-indigo-500 text-xl">💡</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-rose-500 font-medium flex items-center gap-1">↓ 5.4%</span>
              <span className="text-slate-400 ml-2">beban saat ini</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Tegangan (Voltage)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">221 <span className="text-lg text-slate-400">V</span></h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <span className="text-purple-500 text-xl">🔌</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-medium">Normal</span>
              <span className="text-slate-400 ml-2">(220V - 240V)</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Arus (Ampere)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">5.6 <span className="text-lg text-slate-400">A</span></h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <span className="text-blue-500 text-xl">🔋</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-slate-400">Batas Maks: 10A</span>
            </div>
          </div>

        </div>

        {/* Bagian Grafik & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Grafik Konsumsi Daya</h3>
              <select className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1 text-sm outline-none focus:border-blue-500">
                <option>Hari Ini</option>
                <option>Minggu Ini</option>
                <option>Bulan Ini</option>
              </select>
            </div>
            
            <div className="w-full h-64 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center">
              <p className="text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
                Area Chart / Grafik Recharts
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Status Perangkat</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                  <span className="font-medium text-slate-700">Sensor Utama</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">Online</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                  <span className="font-medium text-slate-700">Panel Surya A</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">Online</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></div>
                  <span className="font-medium text-slate-700">Baterai Cadangan</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-rose-100 text-rose-700 rounded-md">Offline</span>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors text-sm border border-blue-100">
              Lihat Detail Perangkat
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}