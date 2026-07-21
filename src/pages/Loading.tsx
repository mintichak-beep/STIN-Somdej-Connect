import { CuteMedicalLoadingCard } from "../components/CuteMedicalIllustration";

export function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-rose-50/50 via-slate-50 to-sky-50 dark:bg-zinc-950 transition-colors duration-300 p-4">
      <CuteMedicalLoadingCard text="กำลังโหลดระบบ STIN-Somdej Connect..." />
    </div>
  );
}

