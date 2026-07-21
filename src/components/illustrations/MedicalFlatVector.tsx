import React from 'react';

export function MedicalFlatVector({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-square max-w-[440px] mx-auto flex items-center justify-center p-6 ${className}`}>
      {/* Soft background glow circles */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/70 via-rose-50/50 to-amber-50/30 rounded-[3rem] blur-2xl" />

      {/* Main Container Card with Soft Shadow and Rounded Shapes */}
      <div className="relative w-full h-full bg-white/95 backdrop-blur-md rounded-[3rem] p-8 shadow-2xl border border-sky-100/80 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D32F2F] via-sky-400 to-[#D32F2F]" />

        {/* Floating Medical Cross Badge */}
        <div className="absolute top-6 left-6 w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shadow-lg border border-red-100 animate-bounce duration-1000">
          <svg className="w-7 h-7 text-[#D32F2F]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" />
          </svg>
        </div>

        {/* Floating Capsule Badge */}
        <div className="absolute top-8 right-6 px-3.5 py-2 bg-sky-50 rounded-2xl flex items-center gap-2.5 shadow-md border border-sky-100">
          <div className="w-6 h-3 bg-[#D32F2F] rounded-full relative overflow-hidden flex">
            <div className="w-1/2 h-full bg-white/50" />
          </div>
          <span className="text-[11px] font-black text-sky-900 tracking-tight">Medical Care</span>
        </div>

        {/* Central Flat Vector Composition */}
        <div className="relative w-full h-72 flex items-center justify-center mt-4">
          
          {/* Stethoscope Path & Chestpiece */}
          <svg className="absolute inset-0 w-full h-full drop-shadow-sm" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tubing */}
            <path d="M90 60 C90 120, 150 140, 150 200 C150 230, 180 250, 210 230" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" />
            <path d="M210 230 L235 220" stroke="#D32F2F" strokeWidth="6" strokeLinecap="round" />
            
            {/* Chestpiece */}
            <circle cx="235" cy="220" r="18" fill="white" stroke="#D32F2F" strokeWidth="6" />
            <circle cx="235" cy="220" r="8" fill="#E0F2FE" />

            {/* Earpieces */}
            <path d="M80 50 C70 40, 80 20, 95 30" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
            <path d="M100 50 C110 40, 100 20, 85 30" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
          </svg>

          {/* Clipboard Illustration */}
          <div className="absolute left-6 bottom-4 w-36 h-44 bg-white rounded-3xl shadow-2xl border-2 border-sky-100 p-4 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
            {/* Clip */}
            <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 w-12 h-5 bg-slate-300 rounded-lg border border-slate-400 shadow-sm" />
            {/* Paper content lines */}
            <div className="mt-4 space-y-2.5">
              <div className="w-18 h-2.5 bg-red-100 rounded-full" />
              <div className="w-full h-2 bg-slate-100 rounded-full" />
              <div className="w-5/6 h-2 bg-slate-100 rounded-full" />
              <div className="w-4/5 h-2 bg-sky-100 rounded-full" />
              <div className="w-full h-2 bg-slate-100 rounded-full" />
              <div className="w-3/4 h-2 bg-slate-100 rounded-full" />
            </div>
            {/* Checkmark stamp */}
            <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-[#D32F2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Medicine Bottle Illustration */}
          <div className="absolute right-8 bottom-6 w-24 h-32 bg-gradient-to-b from-sky-50 via-white to-sky-50 rounded-3xl shadow-2xl border-2 border-sky-200 p-2.5 flex flex-col items-center transform rotate-6 transition-transform hover:rotate-0 duration-500">
            {/* Cap */}
            <div className="w-12 h-5 bg-[#D32F2F] rounded-xl shadow-md mb-2" />
            {/* Label */}
            <div className="w-full flex-1 bg-white rounded-2xl border border-sky-100 p-2 flex flex-col items-center justify-center space-y-1.5 shadow-inner">
              <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                <span className="text-[#D32F2F] font-black text-sm">+</span>
              </div>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              <div className="w-9 h-1.5 bg-slate-100 rounded-full" />
            </div>
          </div>

          {/* Floating Pill / Capsule */}
          <div className="absolute top-10 right-20 w-14 h-7 bg-gradient-to-r from-[#D32F2F] to-red-400 rounded-full shadow-lg transform rotate-45 flex overflow-hidden border border-white/60">
            <div className="w-1/2 h-full bg-sky-200" />
          </div>

        </div>

        {/* Bottom Banner Tag */}
        <div className="mt-6 px-5 py-2.5 bg-sky-50/90 rounded-2xl border border-sky-100 flex items-center gap-3 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] animate-pulse" />
          <span className="text-xs font-black text-sky-900 tracking-tight">Professional Clinical Practice & Healthcare</span>
        </div>

      </div>
    </div>
  );
}
