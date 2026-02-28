import React, { useEffect } from 'react';

export default function Html5QrcodePlugin({ onScanSuccess }) {
  useEffect(() => {
    const loadScript = async () => {
      // Dynamically load html5-qrcode library
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.4/html5-qrcode.min.js';
      script.onload = () => {
        initializeScanner();
      };
      document.head.appendChild(script);
    };

    const initializeScanner = () => {
      if (window.Html5Qrcode) {
        const qrReader = new window.Html5Qrcode('qr-reader', {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        });

        qrReader
          .start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              onScanSuccess(decodedText);
              qrReader.stop();
            },
            (error) => {
              // Silently ignore errors
            }
          )
          .catch(() => {
            // Fallback if camera access fails
            console.log('Camera not available, manual entry only');
          });
      }
    };

    loadScript();

    return () => {
      if (window.Html5Qrcode) {
        window.Html5Qrcode.getCameras().then(() => {
          // Cleanup if needed
        });
      }
    };
  }, [onScanSuccess]);

  return null;
}
