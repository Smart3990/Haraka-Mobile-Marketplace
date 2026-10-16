import React, { useState } from 'react';
import {
  Search,
  Smartphone,
  Car,
  Shirt,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Shield,
  MapPin,
  Mic,
} from 'lucide-react';

interface OnboardingScreenProps {
  onFinish: () => void;
  onSkip?: () => void;
}

export default function OnboardingScreen({ onFinish, onSkip }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onFinish();
    }
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[#faf8ff] font-['Plus_Jakarta_Sans',sans-serif] text-[#131b2e] min-h-[580px] h-full overflow-y-auto no-scrollbar select-none">
      <div className="flex flex-col w-full max-w-md mx-auto px-5 pt-3 pb-8 flex-1 justify-between">
        {/* Top Bar with Skip or Done */}
        <div className="flex items-center justify-end w-full py-2">
          {currentSlide === 2 ? (
            <button
              type="button"
              onClick={onFinish}
              className="font-bold text-xs text-slate-500 hover:text-slate-900 transition-colors py-1 px-3 rounded-full cursor-pointer"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 active:opacity-70 px-2 py-1 transition-colors cursor-pointer"
            >
              Skip
            </button>
          )}
        </div>

        {/* Pagination Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-1 pb-3">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === 0 ? 'w-7 bg-[#006c45]' : 'w-2 bg-[#dae2fd]'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === 1 ? 'w-7 bg-[#ff7a00]' : 'w-2 bg-[#dae2fd]'
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === 2 ? 'w-7 bg-[#006c45]' : 'w-2 bg-[#dae2fd]'
            }`}
          />
        </div>

        {/* Center Visual Mockup Card */}
        <div className="relative w-full flex items-center justify-center py-2 my-auto">
          {currentSlide === 0 ? (
            /* Onboarding 1 - Verified Deals Nearby Visual Card Mockup */
            <div className="relative w-full max-w-[280px] flex items-center justify-center">
              {/* Soft mint ambient glow */}
              <div className="absolute inset-2 rounded-[2.5rem] bg-[#7ffaba]/30 blur-xl pointer-events-none" />

              {/* Mobile Phone Mockup */}
              <div className="relative w-[234px] h-[334px] rounded-[2.2rem] bg-white shadow-xl flex flex-col p-3 overflow-hidden border border-slate-100">
                {/* Speaker top bar */}
                <div className="w-full flex justify-center mb-2">
                  <div className="w-16 h-1 rounded-full bg-[#d2d9f4]" />
                </div>

                {/* Simulated search bar */}
                <div className="w-full bg-[#f2f3ff] rounded-xl px-2.5 py-1.5 flex items-center gap-2 mb-2.5 shadow-2xs">
                  <Search size={15} className="text-[#006c45] stroke-[2.5]" />
                  <span className="text-[11px] text-slate-400 truncate">
                    iPhone 14 Pro, Toyota, Yeezy...
                  </span>
                </div>

                {/* 3 Product items matching screenshot exactly */}
                <div className="flex flex-col gap-2 flex-1 justify-between">
                  {/* Item 1: iPhone 13 */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f2f3ff] shadow-2xs">
                    <div className="w-10 h-10 rounded-lg bg-[#dae2fd] flex items-center justify-center shrink-0">
                      <Smartphone size={20} className="text-[#006c45] stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          iPhone 13 128GB
                        </span>
                        <CheckCircle2 size={14} className="text-[#006c45] fill-[#006c45]/20 stroke-[2.5]" />
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-[#994700] font-black">GH₵ 4,200</span>
                        <span className="text-[10px] text-slate-500 font-medium">East Legon</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 2: Toyota Vitz */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f2f3ff] shadow-2xs">
                    <div className="w-10 h-10 rounded-lg bg-[#dae2fd] flex items-center justify-center shrink-0">
                      <Car size={20} className="text-[#006c45] stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          Toyota Vitz 2018
                        </span>
                        <CheckCircle2 size={14} className="text-[#006c45] fill-[#006c45]/20 stroke-[2.5]" />
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-[#994700] font-black">GH₵ 48,000</span>
                        <span className="text-[10px] text-slate-500 font-medium">Kumasi</span>
                      </div>
                    </div>
                  </div>

                  {/* Item 3: Sneakers Edition */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f2f3ff] shadow-2xs">
                    <div className="w-10 h-10 rounded-lg bg-[#dae2fd] flex items-center justify-center shrink-0">
                      <Shirt size={20} className="text-[#006c45] stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          Sneakers Edition
                        </span>
                        <CheckCircle2 size={14} className="text-[#006c45] fill-[#006c45]/20 stroke-[2.5]" />
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-[#994700] font-black">GH₵ 350</span>
                        <span className="text-[10px] text-slate-500 font-medium">Osu, Accra</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home indicator pill */}
                <div className="w-full flex justify-center mt-2">
                  <div className="w-20 h-1 rounded-full bg-slate-300" />
                </div>
              </div>
            </div>
          ) : currentSlide === 1 ? (
            /* Slide 2 - Snap, Record & Sell in 60s (Exact Reference Design) */
            <div className="relative w-full flex items-center justify-center my-1">
              <div className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] aspect-square rounded-full flex items-center justify-center bg-white shadow-xl border border-slate-100">
                <div className="absolute inset-4 rounded-full bg-[#f2f3ff]/60 pointer-events-none" />
                <svg className="w-full h-full p-4 select-none" fill="none" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter height="125%" id="harakaSoftDrop" width="120%" x="-10%" y="-10%">
                      <feDropShadow dx="0" dy="8" floodColor="#131b2e" floodOpacity="0.08" stdDeviation="12" />
                    </filter>
                    <linearGradient id="phoneBody" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#131b2e" />
                      <stop offset="100%" stopColor="#283044" />
                    </linearGradient>
                    <linearGradient id="screenGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f2f3ff" />
                    </linearGradient>
                    <linearGradient id="lensGrad" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ff7a00" />
                      <stop offset="100%" stopColor="#994700" />
                    </linearGradient>
                  </defs>
                  <g>
                    <rect fill="url(#phoneBody)" filter="url(#harakaSoftDrop)" height="232" rx="28" width="132" x="74" y="24" />
                    <rect fill="url(#screenGrad)" height="224" rx="24" width="124" x="78" y="28" />
                    <rect fill="#dae2fd" height="6" rx="3" width="48" x="116" y="34" />
                    <rect fill="#eaedff" height="136" rx="16" width="104" x="88" y="52" />
                    <circle cx="140" cy="116" fill="#ff7a00" fillOpacity="0.12" r="32" />
                    <rect fill="#ffffff" filter="url(#harakaSoftDrop)" height="52" rx="8" width="64" x="108" y="86" />
                    <circle cx="140" cy="112" fill="url(#lensGrad)" r="14" />
                    <circle cx="140" cy="112" fill="#ffffff" fillOpacity="0.9" r="6" />
                    <rect fill="#ff7a00" height="7" rx="3" width="16" x="122" y="79" />
                    <path d="M96 60 L104 60" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <path d="M96 60 L96 68" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <path d="M184 60 L176 60" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <path d="M184 60 L184 68" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <path d="M96 180 L104 180" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <path d="M96 180 L96 172" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <path d="M184 180 L176 180" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <path d="M184 180 L184 172" stroke="#ff7a00" strokeLinecap="round" strokeWidth="2.5" />
                    <g>
                      <rect fill="#ffffff" filter="url(#harakaSoftDrop)" height="34" rx="17" width="108" x="86" y="148" />
                      <circle cx="103" cy="165" fill="#006c45" r="11" />
                      <text fill="#ffffff" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="bold" textAnchor="middle" x="103" y="169">₵</text>
                      <text fill="#131b2e" fontFamily="Plus Jakarta Sans" fontSize="13" fontWeight="800" x="120" y="170">GH₵ 1,850</text>
                    </g>
                    <g transform="translate(0, -4)">
                      <circle cx="140" cy="216" fill="#ff7a00" filter="url(#harakaSoftDrop)" r="18" />
                      <rect fill="#ffffff" height="11" rx="3.5" width="7" x="136.5" y="207" />
                      <path d="M133 214C133 218 136 221 140 221C144 221 147 218 147 214" stroke="#ffffff" strokeLinecap="round" strokeWidth="2" />
                      <path d="M140 221V225" stroke="#ffffff" strokeLinecap="round" strokeWidth="2" />
                      <path d="M136.5 225H143.5" stroke="#ffffff" strokeLinecap="round" strokeWidth="2" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          ) : (
            /* Slide 3 - Safe Meetups & Audio description (Exact Reference Design) */
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full bg-[#7ffaba]/30 filter blur-2xl animate-pulse" />
                <div className="relative w-64 h-64 rounded-3xl bg-white shadow-xl flex flex-col items-center justify-between p-4 overflow-hidden border border-slate-100">
                  {/* Top Tags row */}
                  <div className="w-full flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 bg-[#eaedff] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                      <ShieldCheck size={14} className="text-[#006c45]" />
                      <span className="text-[10px] text-[#131b2e] font-bold">Verified Sellers</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#e2e7ff] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                      <MapPin size={12} className="text-[#994700]" />
                      <span className="text-[10px] text-slate-700 font-medium">Physical location</span>
                    </div>
                  </div>

                  {/* Center Shield Icon */}
                  <div className="relative my-auto flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#006c45]/10 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#006c45] flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
                        <Shield size={32} className="text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Audio description badge with waveform */}
                  <div className="w-full bg-[#f2f3ff] rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#7ffaba] flex items-center justify-center">
                        <Mic size={14} className="text-[#005233]" />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-2 bg-[#006c45] rounded-full inline-block" />
                        <span className="w-1 h-4 bg-[#006c45] rounded-full inline-block" />
                        <span className="w-1 h-3 bg-[#006c45] rounded-full inline-block" />
                        <span className="w-1 h-5 bg-[#006c45] rounded-full inline-block" />
                        <span className="w-1 h-2 bg-[#006c45] rounded-full inline-block" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Audio description</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Content matching exact copy and layout */}
        <div className="flex flex-col items-center text-center mt-3 px-2">
          {currentSlide === 0 ? (
            <>
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                Find Verified Deals Nearby
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                Browse thousands of smartphones, vehicles, fashion, and home goods across Accra, Kumasi, and all other regions at true direct prices.
              </p>
            </>
          ) : currentSlide === 1 ? (
            <>
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                Snap, Record &amp; Sell in 60s
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                Turn unused phones, laptops, and furniture into instant cash. Snap a photo, record an audio description, and reach buyers immediately.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                Safe Meetups &amp; Audio description
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                Trade securely with verified members. Meet up at designated safe physical locations and communicate freely via in-app chat
              </p>
            </>
          )}
        </div>

        {/* Bottom CTA Button matching reference */}
        <div className="flex flex-col items-center gap-2 mt-5 w-full">
          <button
            type="button"
            onClick={handleNext}
            className={`w-full h-12 rounded-full text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer ${
              currentSlide === 1 ? 'bg-[#ff7a00] hover:bg-[#ea6e00]' : 'bg-[#006c45] hover:bg-[#005a39]'
            }`}
          >
            <span>{currentSlide === 2 ? 'Get Started with Haraka 🎉' : 'Next'}</span>
            {currentSlide !== 2 && <ArrowRight size={18} className="stroke-[2.5]" />}
          </button>
        </div>
      </div>
    </main>
  );
}
