import type { ReactNode } from "react";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
}: MobileFilterDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-40 transition ${
        isOpen ? "visible" : "invisible"
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="فلتر المنتجات"
        className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <span className="text-sm font-semibold text-slate-900">تصفية المنتجات</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600"
          >
            إغلاق
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
