import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    // If a village was previously scanned and saved, offer to reuse it.
    const sv = localStorage.getItem('scannedVillage');
    if (sv) {
      try {
        const parsed = JSON.parse(sv);
        setSavedVillage(parsed);
        // do not auto-start scanner; user can choose to scan new
      } catch (e) {
        console.error('Failed to parse scannedVillage', e);
        // fallback to starting scanner
        setScanning(true);
        initializeScanner();
      }
    } else {
      // No saved village — start scanner immediately
      setScanning(true);
      initializeScanner();
    }

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current?.scanner) {
      try {
        await scannerRef.current.scanner.stop();
      } catch (err) {
        // Scanner already stopped or not running - this is fine
        console.log('Scanner stop error:', err.message);
      }
    }
  };

  const initializeScanner = async () => {
    // Dynamically load html5-qrcode library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.4/html5-qrcode.min.js';
    script.onload = () => {
      if (window.Html5Qrcode && scanning) {
        const qrReader = new window.Html5Qrcode('qr-reader', {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        });

        scannerRef.current = { scanner: qrReader };

        qrReader
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            (error) => {
              // Silently ignore scanning errors
            }
          )
          .catch((err) => {
            console.log('Camera access denied or not available');
          });
      }
    };
    document.head.appendChild(script);
  };

  const handleScanSuccess = async (decodedText) => {
    // Prevent multiple simultaneous processing
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;
    setScanning(false);
    setLoading(true);

    try {
      await stopScanner();

      const qrCodeId = decodedText.trim();
      console.log('Scanned QR Code:', qrCodeId);

      // Verify village exists by QR code
      const response = await api.getVillageByQRCode(qrCodeId);
      console.log('API Response:', response);
      
      if (!response.data || !response.data.village) {
        throw new Error('Invalid response format from server - missing village data');
      }
      
      const villageData = response.data.village;
      console.log('Village Data:', villageData);

      // Store in local storage
      const scannedData = {
        villageId: villageData._id,
        villageName: villageData.name,
        district: villageData.district,
        state: villageData.state,
        pincode: villageData.pincode,
        scannedAt: new Date().toISOString(),
        qrCodeId: qrCodeId
      };
      
      localStorage.setItem('scannedVillage', JSON.stringify(scannedData));
      console.log('Saved to localStorage:', scannedData);
      setSavedVillage(scannedData);

      // Verify it was saved
      const saved = localStorage.getItem('scannedVillage');
      console.log('Verified saved data:', saved);

      toast.success(`Village "${villageData.name}" scanned successfully!`);
      
      setTimeout(() => {
        navigate(`/qr-notices/${villageData._id}`);
      }, 1500);
    } catch (err) {
      console.error('Error verifying QR code:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Invalid QR code. Please try again.';
      console.error('Full error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      toast.error(errorMsg);
      
      setTimeout(() => {
        processingRef.current = false;
        setScanning(true);
        setLoading(false);
        initializeScanner();
      }, 2000);
    }
  };

  const useSavedVillage = () => {
    if (!savedVillage) return;
    navigate(`/qr-notices/${savedVillage.villageId}`);
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
    
    if (!qrCodeId) {
      toast.error('Please enter a QR code or village ID');
      return;
    }

    handleScanSuccess(qrCodeId);
    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Scan Village QR Code</h1>
          <p className="text-blue-100">Point your camera at a village QR code</p>
        </div>

        {/* Scanner Container */}
        <div className="p-6">
          {!scanning && savedVillage && !loading && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-1">Saved Village</h3>
                <p className="text-gray-700">{savedVillage.villageName} — {savedVillage.district}, {savedVillage.state} {savedVillage.pincode}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={useSavedVillage} className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Use Saved Village</button>
                  <button onClick={() => { setScanning(true); initializeScanner(); }} className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">Scan New</button>
                  <button onClick={clearSavedVillage} className="bg-red-50 border border-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg">Clear</button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-gray-300"></div>
                <span className="relative px-4 bg-white text-gray-500 text-sm font-medium">OR</span>
              </div>

              <form onSubmit={handleManualInput} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manual Entry</label>
                  <input type="text" name="qrCodeInput" placeholder="Enter QR code or village ID" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">Submit</button>
              </form>
            </div>
          )}

          {scanning && !loading && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div id="qr-reader" style={{ width: '100%', minHeight: '300px', borderRadius: '0.5rem' }}></div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-gray-300"></div>
                <span className="relative px-4 bg-white text-gray-500 text-sm font-medium">
                  OR
                </span>
              </div>

              <form onSubmit={handleManualInput} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manual Entry
                  </label>
                  <input
                    type="text"
                    name="qrCodeInput"
                    placeholder="Enter QR code or village ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Submit
                </button>
              </form>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Verifying QR code...</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border-t border-blue-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Scan a village QR code</li>
            <li>✓ Your village info is saved locally</li>
            <li>✓ View all notices from that village</li>
            <li>✓ No login required</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-2 border-t border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
