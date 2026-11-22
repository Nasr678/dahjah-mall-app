import React from 'react';

interface DajjahLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showTagline?: boolean;
  interactive?: boolean;
  withGlow?: boolean;
  customSize?: number;
}

export const DajjahLogo: React.FC<DajjahLogoProps> = ({
  size = 'md',
  className = '',
  showTagline = false,
  interactive = false,
  withGlow = false,
  customSize,
}) => {
  const sizeMap = {
    xs: 32,
    sm: 44,
    md: 64,
    lg: 96,
    xl: 140,
    hero: 220,
  };

  const dimension = customSize || sizeMap[size];

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimension, height: dimension }}
      >
        {/* Ambient Outer Glow */}
        {withGlow && (
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 via-purple-600/20 to-amber-300/40 blur-xl pointer-events-none animate-pulse-glow"
            style={{ transform: 'scale(1.2)' }}
          />
        )}

        {/* SVG High-Definition Official Brand Badge */}
        <svg
          viewBox="0 0 400 400"
          width={dimension}
          height={dimension}
          className="relative z-10 drop-shadow-[0_6px_16px_rgba(15,23,42,0.14)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer Gold Border Gradient */}
            <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1B8" />
              <stop offset="25%" stopColor="#DFB248" />
              <stop offset="50%" stopColor="#9B6F17" />
              <stop offset="75%" stopColor="#F5D061" />
              <stop offset="100%" stopColor="#B38022" />
            </linearGradient>

            {/* Subtle Inner Ring */}
            <linearGradient id="goldInnerRing" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ECC85A" />
              <stop offset="50%" stopColor="#8C6010" />
              <stop offset="100%" stopColor="#FCE38A" />
            </linearGradient>

            {/* Golden Silk Fabric Gradient */}
            <linearGradient id="silkGoldGrad" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FFF4D0" />
              <stop offset="25%" stopColor="#DFB44B" />
              <stop offset="50%" stopColor="#A4791E" />
              <stop offset="75%" stopColor="#ECC359" />
              <stop offset="100%" stopColor="#8A5F12" />
            </linearGradient>

            {/* Letter N (Gold Gradient) */}
            <linearGradient id="nGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF6D6" />
              <stop offset="30%" stopColor="#E4BA4E" />
              <stop offset="70%" stopColor="#B58420" />
              <stop offset="100%" stopColor="#885E0E" />
            </linearGradient>

            {/* Letter M & S (Royal Purple / Violet Gradient) */}
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E249E" />
              <stop offset="50%" stopColor="#551978" />
              <stop offset="100%" stopColor="#370D52" />
            </linearGradient>

            <linearGradient id="purpleDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6C1E89" />
              <stop offset="50%" stopColor="#4A1368" />
              <stop offset="100%" stopColor="#2E0A44" />
            </linearGradient>

            {/* Drop Shadows */}
            <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.25" />
            </filter>
            <filter id="textGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#2A0845" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* White Circular Medallion Background */}
          <circle cx="200" cy="200" r="185" fill="#FFFFFF" />
          
          {/* Subtle radial sheen on white card */}
          <circle cx="200" cy="200" r="185" fill="url(#innerSheen)" opacity="0.05" />

          {/* Golden Outer Bezel */}
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="url(#goldRingGrad)"
            strokeWidth="10"
          />
          <circle
            cx="200"
            cy="200"
            r="179"
            fill="none"
            stroke="url(#goldInnerRing)"
            strokeWidth="2.5"
            opacity="0.8"
          />

          {/* Coat Hanger with Collar Silhouette (Dark Charcoal) */}
          <g id="hangerGroup" transform="translate(0, -6)">
            {/* Hanger Hook */}
            <path
              d="M200,105 C190,105 186,95 186,88 C186,76 195,68 206,68 C218,68 226,77 224,89 C223,97 217,102 208,107 L208,124"
              fill="none"
              stroke="#222026"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Collar Triangle Center */}
            <path
              d="M178,138 L200,165 L222,138 L208,125 L192,125 Z"
              fill="#25232A"
            />
            {/* Collar Fold Lapels */}
            <path
              d="M178,138 L200,160 L188,162 Z"
              fill="#19171D"
            />
            <path
              d="M222,138 L200,160 L212,162 Z"
              fill="#19171D"
            />
            {/* Hanger Arms */}
            <path
              d="M112,165 C145,150 170,140 188,132 L200,132 L212,132 C230,140 255,150 288,165 C291,166 290,170 286,169 C255,155 230,146 214,139 L186,139 C170,146 145,155 114,169 C110,170 109,166 112,165 Z"
              fill="#25232A"
            />
          </g>

          {/* Flowing Golden Silk Curtain (Left Shoulder & Swirl Under NMS) */}
          <g id="goldenSilk" filter="url(#logoShadow)">
            {/* Upper gathered drape on hanger left */}
            <path
              d="M142,154 C132,168 118,188 95,202 C92,204 88,214 96,218 C115,226 128,215 136,198 C144,182 147,166 142,154 Z"
              fill="url(#silkGoldGrad)"
            />
            {/* Flowing bottom bell folds of curtain */}
            <path
              d="M93,205 C85,212 87,222 97,225 C108,228 118,223 124,216 C129,210 134,198 136,186 C124,195 106,200 93,205 Z"
              fill="url(#silkGoldGrad)"
            />
            {/* Inner fold shadows */}
            <path
              d="M114,194 C120,205 125,217 127,222 C129,220 133,212 134,204 C130,196 122,192 114,194 Z"
              fill="#7A530E"
              opacity="0.6"
            />
            {/* Sweeping Ribbon under NMS */}
            <path
              d="M136,198 C160,185 200,160 250,210 C275,235 230,248 185,248 C148,248 162,238 188,235 C230,230 255,218 240,200 C215,170 170,180 136,198 Z"
              fill="url(#silkGoldGrad)"
            />
          </g>

          {/* Luxury Stylized Brand Letters "N M S" */}
          <g id="lettersNMS" filter="url(#textGlow)">
            {/* Two Golden Sparkle Dots above 'M' */}
            <circle cx="258" cy="168" r="4.5" fill="url(#goldRingGrad)" />
            <circle cx="272" cy="168" r="4.5" fill="url(#goldRingGrad)" />

            {/* Letter 'N' (Polished 3D Gold Gradient) */}
            <path
              d="M152,172 L172,172 L198,220 L198,172 L216,172 L216,242 L196,242 L170,194 L170,242 L152,242 Z"
              fill="url(#nGoldGrad)"
            />
            {/* Letter 'N' 3D bevel stroke/shadow */}
            <path
              d="M152,172 L172,172 L198,220 L198,172"
              fill="none"
              stroke="#FFF8E0"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Letter 'M' (Royal Purple / Violet Gradient) */}
            <path
              d="M218,172 L242,172 L260,215 L278,172 L302,172 L302,242 L285,242 L285,198 L268,238 L252,238 L235,198 L235,242 L218,242 Z"
              fill="url(#purpleGrad)"
            />

            {/* Letter 'S' (Royal Purple / Violet Gradient) */}
            <path
              d="M312,230 C312,238 320,244 332,244 C344,244 352,238 352,229 C352,221 346,216 334,213 L325,210 C312,207 304,198 304,188 C304,176 316,168 331,168 C345,168 356,175 357,188 L340,188 C339,182 334,179 328,179 C322,179 318,182 318,187 C318,193 323,196 333,198 L342,201 C357,205 366,214 366,227 C366,241 352,252 332,252 C314,252 300,242 300,230 Z"
              fill="url(#purpleDarkGrad)"
            />
          </g>

          {/* Arabic Brand Subtitle: "ضجة مول للتخفيضات" */}
          <text
            x="200"
            y="282"
            textAnchor="middle"
            fontFamily="'Cairo', 'Tajawal', sans-serif"
            fontWeight="900"
            fontSize="26"
            fill="#52146E"
            letterSpacing="0.5"
          >
            ضجة مول للتخفيضات
          </text>

          {/* English Subtitle: "MALL BUZZ FOR DISCOUNTS" */}
          <text
            x="200"
            y="306"
            textAnchor="middle"
            fontFamily="'Cairo', sans-serif"
            fontWeight="800"
            fontSize="14"
            fill="#6B1D4E"
            letterSpacing="1.8"
          >
            MALL BUZZ FOR DISCOUNTS
          </text>
        </svg>
      </div>

      {showTagline && (
        <div className="mt-3 text-center">
          <h1 className="text-xl md:text-2xl font-black text-amber-700 tracking-wide">
            ضَجّة مول
          </h1>
          <p className="text-xs md:text-sm font-bold text-neutral-600 tracking-wider mt-0.5">
            ضَجّة في وجه الغلاء
          </p>
        </div>
      )}
    </div>
  );
};
