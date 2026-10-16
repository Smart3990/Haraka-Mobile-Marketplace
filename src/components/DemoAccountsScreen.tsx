import React from 'react';
import { X } from 'lucide-react';

interface DemoAccountsScreenProps {
  onBack: () => void;
  onSelectRole: (role: 'buyer' | 'seller' | 'artisan' | 'admin') => void;
}

export default function DemoAccountsScreen({
  onBack,
  onSelectRole,
}: DemoAccountsScreenProps) {
  return (
    <div
      className="relative w-full h-full min-h-full flex-1 flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#94A3B8 1.25px, transparent 1.25px)',
        backgroundSize: '16px 16px',
      }}
    >
      {/* Transparent blur backdrop overlay strictly inside the simulator */}
      <div
        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onBack();
          }
        }}
      >
        {/* Single Card Modal */}
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-[310px] bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 pt-3 relative animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top closing icon only */}
          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={onBack}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 active:scale-90 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Single card with 4 texts only (roles) laid in 2-grid */}
          <div className="grid grid-cols-2 gap-2.5 pb-2">
            <button
              type="button"
              onClick={() => onSelectRole('buyer')}
              className="py-3 px-2 rounded-xl text-center text-[13px] font-bold text-slate-800 hover:text-[#FF6A00] hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Authenticated User
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('seller')}
              className="py-3 px-2 rounded-xl text-center text-[13px] font-bold text-slate-800 hover:text-[#FF6A00] hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Seller
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('artisan')}
              className="py-3 px-2 rounded-xl text-center text-[13px] font-bold text-slate-800 hover:text-[#FF6A00] hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Artisan
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('admin')}
              className="py-3 px-2 rounded-xl text-center text-[13px] font-bold text-slate-800 hover:text-[#FF6A00] hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
