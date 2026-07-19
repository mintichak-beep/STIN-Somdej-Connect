import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { dbService } from '../services/db.service';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToPortal: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToPortal }) => {
  const [pin, setPin] = useState<string>('');
  const [dbPin, setDbPin] = useState<string>('123456');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch true admin PIN from Firestore settings
  const fetchPin = async () => {
    setLoading(true);
    try {
      const livePin = await dbService.getAdminPin();
      setDbPin(livePin);
    } catch (err) {
      console.error('Error fetching admin PIN:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPin();
  }, []);

  // Handle number click
  const handleNumClick = (num: string) => {
    setError(null);
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      // Auto submit when reach 6 digits
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  // Delete last digit
  const handleDelete = () => {
    setError(null);
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  // Clear pin
  const handleClear = () => {
    setError(null);
    setPin('');
  };

  // Verify PIN
  const verifyPin = (enteredPin: string) => {
    if (enteredPin === dbPin) {
      setSuccess(true);
      setError(null);
      // Let success transition animate briefly
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } else {
      setError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPin(''); // Reset
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <button 
        onClick={onBackToPortal}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้าพอร์ทัลนักศึกษา</span>
      </button>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl text-center">
        
        {/* Emblem */}
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          {success ? (
            <Check className="w-8 h-8 animate-bounce text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">แผงควบคุมฝ่ายปกครองหอพัก</h2>
        <p className="text-xs text-gray-400 mt-1 mb-6 uppercase tracking-wider font-bold">กรุณาป้อนรหัสผ่าน Admin PIN 6 หลัก</p>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
            <span className="text-xs text-gray-400 font-semibold">กำลังยืนยันความปลอดภัย...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* PIN Code Dots display */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div 
                  key={index}
                  className={`w-4.5 h-4.5 rounded-full transition-all duration-150 border-2 ${
                    pin.length > index 
                      ? 'bg-red-600 border-red-600 scale-110' 
                      : 'bg-transparent border-gray-300 dark:border-zinc-700'
                  }`}
                />
              ))}
            </div>

            {/* Error alerts */}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* PIN Pad buttons */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumClick(num)}
                  className="h-14 bg-gray-50 dark:bg-zinc-800/50 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:text-red-400 active:scale-95 text-lg font-black text-gray-900 dark:text-white rounded-2xl transition cursor-pointer flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-14 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/40 text-xs font-bold text-gray-500 rounded-2xl transition cursor-pointer flex items-center justify-center active:scale-95"
              >
                ล้างข้อมูล
              </button>
              <button
                type="button"
                onClick={() => handleNumClick('0')}
                className="h-14 bg-gray-50 dark:bg-zinc-800/50 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-lg font-black text-gray-900 dark:text-white rounded-2xl transition cursor-pointer flex items-center justify-center active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-14 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/40 text-xs font-bold text-gray-500 rounded-2xl transition cursor-pointer flex items-center justify-center active:scale-95"
              >
                ลบออก
              </button>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
              *รหัสผ่านตั้งต้นจากระบบคือ <span className="font-bold underline">123456</span> สามารถเปลี่ยนผ่านแผงปกครองหลังเข้าระบบ
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
