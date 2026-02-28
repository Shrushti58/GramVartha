import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function QRScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const [savedVillage, setSavedVillage] = useState(null);
  const processingRef = useRef(false);

  useEffect(() => {
    const sv = localStorage.getItem('scannedVillage');
    if (sv) {
      try {
        const parsed = JSON.parse(sv);
        setSavedVillage(parsed);
      } catch (e) {
        setScanning(true);
        initializeScanner();
      }
    } else {
      setScanning(true);
      initializeScanner();
    }
    return () => { stopScanner(); };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current?.scanner) {
      try { await scannerRef.current.scanner.stop(); } catch (err) {}
    }
  };

  const initializeScanner = async () => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.4/html5-qrcode.min.js';
    script.onload = () => {
      if (window.Html5Qrcode) {
        const qrReader = new window.Html5Qrcode('qr-reader');
        scannerRef.current = { scanner: qrReader };
        qrReader.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => { handleScanSuccess(decodedText); },
          () => {}
        ).catch(() => {});
      }
    };
    document.head.appendChild(script);
  };

  const handleScanSuccess = async (decodedText) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setScanning(false);
    setLoading(true);
    try {
      await stopScanner();
      const qrCodeId = decodedText.trim();
      const response = await api.getVillageByQRCode(qrCodeId);
      if (!response.data?.village) throw new Error('Invalid response from server');
      const villageData = response.data.village;
      const scannedData = {
        villageId: villageData._id,
        villageName: villageData.name,
        district: villageData.district,
        state: villageData.state,
        pincode: villageData.pincode,
        scannedAt: new Date().toISOString(),
        qrCodeId,
      };
      localStorage.setItem('scannedVillage', JSON.stringify(scannedData));
      setSavedVillage(scannedData);
      toast.success(`Village "${villageData.name}" scanned successfully!`);
      setTimeout(() => navigate(`/qr-notices/${villageData._id}`), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Invalid QR code. Please try again.');
      setTimeout(() => {
        processingRef.current = false;
        setScanning(true);
        setLoading(false);
        initializeScanner();
      }, 2000);
    }
  };

  const useSavedVillage = () => {
    if (savedVillage) navigate(`/qr-notices/${savedVillage.villageId}`);
  };

  const clearSavedVillage = () => {
    localStorage.removeItem('scannedVillage');
    setSavedVillage(null);
    setScanning(true);
    initializeScanner();
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const qrCodeId = e.target.qrCodeInput.value.trim();
    if (!qrCodeId) { toast.error('Please enter a QR code or village ID'); return; }
    handleScanSuccess(qrCodeId);
    e.target.reset();
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300";

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden">
        <img src="/illu1.png" alt="Village" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2218]/95 via-[#1a3a2a]/80 to-[#0d2218]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2218]/90 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">GramVartha</span>
          </Link>
        </div>

        {/* Copy */}
        <div className="relative z-10 px-10 pb-16 space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/70 font-medium tracking-wide">QR Access</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Scan to access<br />
            <span className="text-green-400">village notices</span>
          </h2>
          <p className="text-white/50 leading-relaxed max-w-sm text-sm">
            Point your camera at any village QR code to instantly access public notices, updates, and announcements — no login needed.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {['Instant Access', 'No Login', 'Live Notices', 'Offline Save'].map((f) => (
              <span key={f} className="text-xs text-white/60 border border-white/10 rounded-full px-3 py-1.5">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-white px-10 py-8">
        <div className="w-full max-w-[400px] space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-green-50 border border-green-100">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900">GramVartha</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scan Village QR Code</h1>
            <p className="text-sm text-gray-400 mt-1.5">Point your camera at a village QR code to get started</p>
          </div>

          {/* ── Saved Village State ── */}
          {!scanning && savedVillage && !loading && (
            <div className="space-y-5">
              {/* Saved card */}
              <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">Saved Village</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{savedVillage.villageName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{[savedVillage.district, savedVillage.state, savedVillage.pincode].filter(Boolean).join(', ')}</p>
                  </div>
                  <button onClick={clearSavedVillage} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0" title="Clear">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button onClick={useSavedVillage}
                  className="w-full mt-3 py-2.5 px-4 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-green-900/20">
                  View Village Notices
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 font-medium">or scan a new one</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <button onClick={() => { setScanning(true); initializeScanner(); }}
                className="w-full py-3 px-4 border border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-700 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 8H3m18-8h-2M4 4l16 16" />
                </svg>
                Scan New QR Code
              </button>

              {/* Manual entry */}
              <form onSubmit={handleManualInput} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Manual Entry</label>
                <div className="flex gap-2">
                  <input type="text" name="qrCodeInput" placeholder="Enter QR code or village ID" className={`${inp} flex-1`} />
                  <button type="submit"
                    className="px-4 py-3 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Scanning State ── */}
          {scanning && !loading && (
            <div className="space-y-5">
              {/* Camera viewport */}
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative">
                <div id="qr-reader" style={{ width: '100%' }} />
                {/* Corner guides */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-44 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 font-medium">or enter manually</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Manual entry */}
              <form onSubmit={handleManualInput} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Manual Entry</label>
                <div className="flex gap-2">
                  <input type="text" name="qrCodeInput" placeholder="Enter QR code or village ID" className={`${inp} flex-1`} />
                  <button type="submit"
                    className="px-4 py-3 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Loading State ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Verifying QR code</p>
                <p className="text-xs text-gray-400 mt-1">Please wait a moment...</p>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-500 leading-relaxed">
              Scan any village QR code to view public notices. Your village is saved locally so you don't need to scan again next time.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              No login required
            </div>
            <Link to="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to homepage
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}