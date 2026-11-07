import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSerial?: (serial: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onSelectSerial }) => {
  const [manualSerial, setManualSerial] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    let scanner: Html5QrcodeScanner | null = null;
    const timer = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          { fps: 10, qrbox: { width: 220, height: 220 } },
          false
        );

        scanner.render(
          (decodedText) => {
            // Check if JSON payload or pure serial
            let serial = decodedText;
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed.serial) serial = parsed.serial;
            } catch {
              // Plain serial string
            }

            if (scanner) scanner.clear();
            handleSelect(serial);
          },
          (err) => {
            // ignore continuous scanning frame errors
          }
        );
      } catch (err: any) {
        setScanError('Camera not accessible. You can enter or select the panel serial manually below.');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (serial: string) => {
    const clean = serial.trim().toUpperCase();
    if (!clean) return;
    onClose();
    if (onSelectSerial) {
      onSelectSerial(clean);
    } else {
      navigate(`/panel/${clean}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <QrCode className="w-5 h-5 text-industrial-amber" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Scan Panel QR Code</h3>
              <p className="text-xs text-stone-500">Shopfloor Traceability Scanner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Container */}
        <div className="p-5">
          <div
            id="qr-reader-container"
            className="w-full rounded-lg overflow-hidden border-2 border-dashed border-stone-300 bg-stone-50 min-h-[220px] flex items-center justify-center text-xs text-stone-500"
          >
            Initializing camera stream...
          </div>

          {scanError && (
            <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
              {scanError}
            </p>
          )}

          {/* Quick Manual Entry */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Manual Serial Number Lookup
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. BEE-12K-2026-001"
                value={manualSerial}
                onChange={(e) => setManualSerial(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(manualSerial)}
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => handleSelect(manualSerial)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Find
              </button>
            </div>

            {/* Quick Demonstration Shortcut Buttons */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-stone-500 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Demo Sample Panels:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { serial: 'BEE-12K-2026-001', label: 'Primary VCB (001)' },
                  { serial: 'BEE-12K-2026-002', label: 'Dispatched (002)' },
                  { serial: 'BEE-12K-2026-003', label: 'Dispatch Ready (003)' },
                ].map((item) => (
                  <button
                    key={item.serial}
                    onClick={() => handleSelect(item.serial)}
                    className="text-xs font-mono bg-stone-100 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 px-2.5 py-1 rounded transition-colors text-stone-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
