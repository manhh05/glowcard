import React from 'react';
import { ProductType } from '../types';

interface ProductArtworkProps {
  type: ProductType | 'hero';
  className?: string;
  variant?: string;
  title?: string;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  type,
  className = 'w-full h-full',
  variant,
  title,
}) => {
  if (type === 'hero') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-[#F5EFEB] via-[#EFE6DC] to-[#E3D4C4] flex items-center justify-center ${className}`}>
        {/* Soft background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_35%,rgba(255,248,235,0.8),transparent_65%)]" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-amber-200/20 blur-2xl" />

        <svg viewBox="0 0 800 500" className="w-full h-full object-contain relative z-10 p-6" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wooden/Stone Base */}
          <ellipse cx="400" cy="420" rx="340" ry="40" fill="#DDD0BF" opacity="0.6" />
          <ellipse cx="400" cy="415" rx="310" ry="32" fill="#E8DEC4" opacity="0.4" />

          {/* Large Amber Candle (Left) */}
          <g transform="translate(180, 160)">
            <ellipse cx="80" cy="220" rx="70" ry="16" fill="#8B6038" opacity="0.3" />
            {/* Glass Jar Body */}
            <rect x="15" y="60" width="130" height="155" rx="8" fill="#5A3A1E" />
            <rect x="20" y="65" width="120" height="145" rx="6" fill="url(#amber-glass-hero)" />
            {/* Wax Layer */}
            <ellipse cx="80" cy="80" rx="55" ry="12" fill="#FAF5EB" />
            {/* Jar Rim */}
            <ellipse cx="80" cy="60" rx="65" ry="10" fill="#472A14" />
            <ellipse cx="80" cy="60" rx="58" ry="8" fill="#6A4526" />
            {/* Wick */}
            <line x1="80" y1="80" x2="80" y2="60" stroke="#2B1A0E" strokeWidth="3" strokeLinecap="round" />
            {/* Candle Flame with Glow */}
            <circle cx="80" cy="46" r="18" fill="#FBBF24" opacity="0.3" filter="blur(4px)" />
            <path d="M80 34 C86 44 87 56 80 62 C73 56 74 44 80 34 Z" fill="url(#flame-grad)" />
            <path d="M80 44 C83 48 83 55 80 58 C77 55 77 48 80 44 Z" fill="#FFFBEB" />
            {/* Kraft Label */}
            <rect x="35" y="105" width="90" height="75" rx="3" fill="#F4EFE6" stroke="#D1C4B2" strokeWidth="1" />
            <line x1="45" y1="120" x2="115" y2="120" stroke="#78350F" strokeWidth="1" strokeDasharray="2 2" />
            <text x="80" y="136" textAnchor="middle" fill="#451A03" fontSize="11" fontFamily="serif" fontWeight="bold">GLOWCARD</text>
            <text x="80" y="148" textAnchor="middle" fill="#78350F" fontSize="8" letterSpacing="1">SOY CANDLE</text>
            <line x1="55" y1="156" x2="105" y2="156" stroke="#92400E" strokeWidth="0.75" />
            <text x="80" y="168" textAnchor="middle" fill="#92400E" fontSize="7">HANDCRAFTED</text>
          </g>

          {/* Scented Wax Card (Hanging in middle) */}
          <g transform="translate(380, 140)">
            <ellipse cx="70" cy="250" rx="55" ry="12" fill="#8B6038" opacity="0.25" />
            {/* Satin Ribbon */}
            <path d="M70 20 C65 5 75 -15 70 -30 C65 -15 75 5 70 20" stroke="#9A3412" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="40" r="6" fill="#78350F" />
            <circle cx="70" cy="40" r="3" fill="#E8DEC4" />
            {/* Wax Tablet Shape */}
            <rect x="20" y="30" width="100" height="150" rx="10" fill="#FFFDF8" stroke="#E6DAC8" strokeWidth="1.5" />
            <rect x="25" y="35" width="90" height="140" rx="8" fill="url(#wax-texture)" opacity="0.9" />
            {/* Pressed Dried Botanicals inside wax */}
            <path d="M70 140 Q65 110 50 85 Q70 100 85 80" stroke="#4D7C0F" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="85" r="7" fill="#E11D48" opacity="0.8" />
            <circle cx="85" cy="80" r="6" fill="#F59E0B" opacity="0.85" />
            <circle cx="68" cy="100" r="5" fill="#DB2777" opacity="0.75" />
            <circle cx="45" cy="115" r="4" fill="#D97706" opacity="0.7" />
            {/* Wax Stamp Seal */}
            <circle cx="70" cy="148" r="14" fill="#9A3412" />
            <text x="70" y="152" textAnchor="middle" fill="#FEF3C7" fontSize="10" fontFamily="serif" fontWeight="bold">GC</text>
          </g>

          {/* Small Amber Candle (Right) */}
          <g transform="translate(530, 200)">
            <ellipse cx="60" cy="180" rx="55" ry="14" fill="#8B6038" opacity="0.25" />
            <rect x="15" y="50" width="90" height="120" rx="6" fill="#4B2E15" />
            <rect x="19" y="54" width="82" height="112" rx="5" fill="url(#amber-glass-hero)" />
            <ellipse cx="60" cy="65" rx="38" ry="9" fill="#FFFDF8" />
            <ellipse cx="60" cy="50" rx="45" ry="7" fill="#3D230E" />
            <line x1="60" y1="65" x2="60" y2="50" stroke="#2B1A0E" strokeWidth="2.5" />
            {/* Flame */}
            <circle cx="60" cy="38" r="14" fill="#FBBF24" opacity="0.25" filter="blur(3px)" />
            <path d="M60 28 C64 36 65 46 60 51 C55 46 56 36 60 28 Z" fill="url(#flame-grad)" />
            {/* Kraft Label */}
            <rect x="30" y="85" width="60" height="55" rx="2" fill="#F4EFE6" stroke="#D1C4B2" strokeWidth="1" />
            <text x="60" y="105" textAnchor="middle" fill="#451A03" fontSize="8" fontFamily="serif" fontWeight="bold">GLOWCARD</text>
            <text x="60" y="117" textAnchor="middle" fill="#92400E" fontSize="6">30ml Soy</text>
          </g>

          {/* Floating Dried Petals */}
          <g opacity="0.6">
            <ellipse cx="140" cy="390" rx="8" ry="4" transform="rotate(-20 140 390)" fill="#E11D48" />
            <ellipse cx="500" cy="405" rx="7" ry="3" transform="rotate(35 500 405)" fill="#F59E0B" />
            <ellipse cx="320" cy="395" rx="6" ry="3" transform="rotate(-15 320 395)" fill="#FB7185" />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="amber-glass-hero" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="35%" stopColor="#92400E" />
              <stop offset="65%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="flame-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="wax-texture" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FAF7F2" />
              <stop offset="100%" stopColor="#F2EAE0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === 'wax_card') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-[#FBF8F3] to-[#F1E9DE] flex items-center justify-center p-6 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.7),transparent_70%)]" />
        <svg viewBox="0 0 300 320" className="w-full h-full max-h-56 object-contain relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="150" cy="295" rx="75" ry="14" fill="#8B6038" opacity="0.18" />
          
          {/* Top Hanging Ribbon */}
          <path d="M150 15 C145 2 155 -10 150 -20 C145 -10 155 2 150 15" stroke="#9A3412" strokeWidth="4" strokeLinecap="round" />
          <circle cx="150" cy="45" r="7" fill="#78350F" />
          <circle cx="150" cy="45" r="3.5" fill="#E8DEC4" />

          {/* Wax Sachet Body */}
          <rect x="75" y="32" width="150" height="230" rx="14" fill="#FFFDF8" stroke="#E3D7C5" strokeWidth="2" />
          <rect x="82" y="39" width="136" height="216" rx="10" fill="#FAF6EE" />

          {/* Embedded Dried Flowers & Herbs */}
          <path d="M150 200 Q140 150 115 110 Q145 130 175 95 Q155 145 150 200" stroke="#65A30D" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="115" cy="110" r="10" fill="#E11D48" opacity="0.85" />
          <circle cx="115" cy="110" r="5" fill="#FECDD3" />
          <circle cx="175" cy="95" r="9" fill="#F59E0B" opacity="0.85" />
          <circle cx="175" cy="95" r="4" fill="#FEF3C7" />
          <circle cx="140" cy="135" r="7" fill="#DB2777" opacity="0.8" />
          <circle cx="165" cy="160" r="6" fill="#F97316" opacity="0.75" />
          <circle cx="110" cy="170" r="5" fill="#84CC16" opacity="0.7" />

          {/* Artisanal Wax Seal */}
          <circle cx="150" cy="225" r="18" fill="#9A3412" />
          <text x="150" y="230" textAnchor="middle" fill="#FEF3C7" fontSize="12" fontFamily="serif" fontWeight="bold">GC</text>
        </svg>
      </div>
    );
  }

  if (type === 'combo') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-[#F7F2EA] to-[#E9DFD0] flex items-center justify-center p-4 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.6),transparent_60%)]" />
        <svg viewBox="0 0 340 300" className="w-full h-full max-h-56 object-contain relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="170" cy="275" rx="140" ry="18" fill="#8B6038" opacity="0.2" />

          {/* Kraft Gift Box Base */}
          <rect x="40" y="110" width="260" height="150" rx="8" fill="#D4B996" stroke="#B89770" strokeWidth="2" />
          <rect x="45" y="115" width="250" height="140" rx="6" fill="#DEC3A2" />

          {/* Box Ribbon */}
          <rect x="160" y="110" width="20" height="150" fill="#9A3412" />
          {/* Ribbon Bow */}
          <path d="M150 110 C130 85 140 75 160 95 C170 85 180 85 190 95 C210 75 220 85 190 110" fill="#9A3412" />

          {/* Peek Candle 1 inside */}
          <g transform="translate(60, 50)">
            <rect x="10" y="30" width="55" height="75" rx="4" fill="#78350F" />
            <ellipse cx="37" cy="38" rx="23" ry="6" fill="#FFFBEB" />
            <line x1="37" y1="38" x2="37" y2="28" stroke="#331A08" strokeWidth="2" />
            <circle cx="37" cy="20" r="5" fill="#F59E0B" />
            <rect x="18" y="52" width="40" height="35" rx="2" fill="#FAF5EB" />
          </g>

          {/* Peek Candle 2 or Wax Card */}
          <g transform="translate(205, 45)">
            <rect x="10" y="35" width="55" height="75" rx="4" fill="#78350F" />
            <ellipse cx="37" cy="43" rx="23" ry="6" fill="#FFFBEB" />
            <line x1="37" y1="43" x2="37" y2="33" stroke="#331A08" strokeWidth="2" />
            <circle cx="37" cy="25" r="5" fill="#F59E0B" />
            <rect x="18" y="57" width="40" height="35" rx="2" fill="#FAF5EB" />
          </g>

          {/* Botanical sprig sticking out */}
          <path d="M170 100 Q150 50 120 40 Q155 60 170 100" stroke="#4D7C0F" strokeWidth="2" strokeLinecap="round" />
          <circle cx="120" cy="40" r="5" fill="#E11D48" />

          {/* Gift Box Tag */}
          <rect x="120" y="160" width="100" height="50" rx="3" fill="#FFFDF8" stroke="#D1C4B2" strokeWidth="1" />
          <text x="170" y="180" textAnchor="middle" fill="#451A03" fontSize="10" fontFamily="serif" fontWeight="bold">GLOWCARD</text>
          <text x="170" y="196" textAnchor="middle" fill="#92400E" fontSize="8">GIFT COMBO</text>
        </svg>
      </div>
    );
  }

  // Default: Scented Candle
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-[#FAF6F0] to-[#EFE6DC] flex items-center justify-center p-6 ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.7),transparent_70%)]" />
      <svg viewBox="0 0 280 320" className="w-full h-full max-h-56 object-contain relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <ellipse cx="140" cy="285" rx="80" ry="16" fill="#8B6038" opacity="0.22" />

        {/* Amber Jar */}
        <g transform="translate(45, 40)">
          {/* Main Jar glass */}
          <rect x="25" y="70" width="140" height="160" rx="10" fill="#543317" />
          <rect x="30" y="75" width="130" height="150" rx="8" fill="url(#candle-amber-body)" />
          {/* Wax surface */}
          <ellipse cx="95" cy="90" rx="60" ry="12" fill="#FAF6EE" />
          {/* Glass Rim */}
          <ellipse cx="95" cy="70" rx="70" ry="11" fill="#42250E" />
          <ellipse cx="95" cy="70" rx="63" ry="8" fill="#6B4120" />
          {/* Cotton Wick */}
          <line x1="95" y1="90" x2="95" y2="70" stroke="#2B1A0E" strokeWidth="3" strokeLinecap="round" />
          {/* Glowing Flame */}
          <circle cx="95" cy="55" r="16" fill="#FBBF24" opacity="0.3" filter="blur(3px)" />
          <path d="M95 42 C101 52 102 64 95 70 C88 64 89 52 95 42 Z" fill="url(#candle-flame)" />
          <path d="M95 54 C98 58 98 64 95 67 C92 64 92 58 95 54 Z" fill="#FFFBEB" />

          {/* Aesthetic Kraft Label */}
          <rect x="50" y="115" width="90" height="85" rx="3" fill="#F8F3EA" stroke="#D8C8B6" strokeWidth="1" />
          <line x1="60" y1="130" x2="130" y2="130" stroke="#78350F" strokeWidth="0.8" strokeDasharray="2 2" />
          <text x="95" y="148" textAnchor="middle" fill="#451A03" fontSize="12" fontFamily="serif" fontWeight="bold">GLOWCARD</text>
          <text x="95" y="162" textAnchor="middle" fill="#78350F" fontSize="8" letterSpacing="1">NẾN THƠM THỦ CÔNG</text>
          <line x1="70" y1="172" x2="120" y2="172" stroke="#92400E" strokeWidth="0.8" />
          <text x="95" y="186" textAnchor="middle" fill="#92400E" fontSize="8">100% SOY WAX</text>
        </g>

        <defs>
          <linearGradient id="candle-amber-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#693B16" />
            <stop offset="40%" stopColor="#92400E" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#693B16" />
          </linearGradient>
          <linearGradient id="candle-flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
