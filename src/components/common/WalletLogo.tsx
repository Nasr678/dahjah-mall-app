import React from 'react';
import { PaymentMethodType } from '../../types';
import { Banknote, CreditCard } from 'lucide-react';

interface WalletLogoProps {
  methodId?: PaymentMethodType;
  type?: PaymentMethodType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
}

export const WalletLogo: React.FC<WalletLogoProps> = ({
  methodId,
  type,
  className = '',
  size = 'md',
}) => {
  const activeMethod = type || methodId || 'cash_on_delivery';

  // Calculate dimensions
  let dimensionStyle: React.CSSProperties = {};
  let sizeClass = 'w-12 h-12';

  if (typeof size === 'number') {
    dimensionStyle = { width: `${size}px`, height: `${size}px` };
    sizeClass = '';
  } else {
    const sizeMap: Record<string, string> = {
      sm: 'w-9 h-9',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
    };
    sizeClass = sizeMap[size] || 'w-12 h-12';
  }

  switch (activeMethod) {
    // 1. الدفع عند الاستلام — Cash on Delivery
    case 'cash_on_delivery':
      return (
        <div
          style={dimensionStyle}
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/25 to-emerald-900/40 border border-emerald-500/50 p-2 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/40 flex-shrink-0 ${className}`}
          title="الدفع عند الاستلام"
        >
          <Banknote className="w-full h-full text-emerald-400" />
        </div>
      );

    // 2. جيب — Jaib (Official logo: Red logo #E51B24 with emblem + Arabic 'جيب' + English 'Jaib')
    case 'jeeb':
      return (
        <div
          style={dimensionStyle}
          className={`${sizeClass} rounded-2xl bg-white border border-rose-200/80 p-1 flex items-center justify-center relative overflow-hidden shadow-md shadow-rose-950/20 flex-shrink-0 ${className}`}
          title="محفظة جيب — Jaib"
        >
          <svg viewBox="0 0 200 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Official Jaib Red Color: #E51B24 */}
            <g transform="translate(10, 5)">
              <path
                d="M 5,20 H 75 C 82,20 88,26 88,33 V 65 C 88,85 70,95 46,95 C 22,95 5,85 5,65 V 48 H 19 V 63 C 19,75 30,81 46,81 C 62,81 74,75 74,63 V 34 H 5 Z"
                fill="#E51B24"
              />
              <path
                d="M 5,20 H 28 C 32,20 35,23 35,27 V 48 H 21 V 34 H 5 Z"
                fill="#E51B24"
              />
              <circle cx="34" cy="38" r="8.5" fill="#E51B24" />
            </g>

            {/* Arabic 'جيب' */}
            <g fill="#E51B24">
              <path
                d="M 105,48 C 105,32 120,28 140,28 C 165,28 185,32 195,38 L 190,50 C 180,45 165,41 142,41 C 126,41 120,44 120,50 C 120,55 125,58 136,58 L 185,58 C 192,58 195,62 195,68 L 195,70 C 195,75 190,78 180,78 L 105,78 L 105,65 L 175,65 L 132,65 C 114,65 105,58 105,48 Z"
              />
              <circle cx="132" cy="90" r="4" />
              <circle cx="144" cy="90" r="4" />
              <circle cx="120" cy="22" r="4" />
            </g>

            {/* English 'Jaib' */}
            <text
              x="148"
              y="104"
              textAnchor="middle"
              fill="#E51B24"
              fontSize="28"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.5"
            >
              Jaib
            </text>
          </svg>
        </div>
      );

    // 3. الكريمي — Kuraimi (Official logo: Purple #6B2A8C + Islamic Mandala Pattern)
    case 'kuraimi':
      return (
        <div
          style={dimensionStyle}
          className={`${sizeClass} rounded-2xl bg-[#6B2A8C] border border-purple-400/40 p-1 flex items-center justify-center relative overflow-hidden shadow-md shadow-purple-950/50 flex-shrink-0 ${className}`}
          title="محفظة الكريمي — الكريمي جوال / حاسب"
        >
          <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="160" height="160" rx="20" fill="#6B2A8C" />
            <g transform="translate(80, 80)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                <g key={idx} transform={`rotate(${angle})`}>
                  <polygon
                    points="0,-68 8,-56 0,-44 -8,-56"
                    fill="#FFFFFF"
                  />
                  <polygon
                    points="16,-56 22,-48 16,-40 10,-48"
                    fill="#FFFFFF"
                  />
                  <polygon
                    points="0,-40 10,-28 0,-16 -10,-28"
                    fill="#FFFFFF"
                  />
                  <polygon
                    points="18,-36 26,-28 18,-20 10,-28"
                    fill="#FFFFFF"
                  />
                  <polygon
                    points="-18,-36 -10,-28 -18,-20 -26,-28"
                    fill="#FFFFFF"
                  />
                  <polygon
                    points="0,-24 7,-16 0,-8 -7,-16"
                    fill="#FFFFFF"
                  />
                </g>
              ))}
              <circle cx="0" cy="0" r="14" fill="#6B2A8C" />
            </g>
          </svg>
        </div>
      );

    // 4. جوالي — Jawali (Official logo: Orange phone + circles + JAWALI text)
    case 'jawali':
      return (
        <div
          style={dimensionStyle}
          className={`${sizeClass} rounded-2xl bg-white border border-amber-200/80 p-1 flex items-center justify-center relative overflow-hidden shadow-md shadow-amber-950/20 flex-shrink-0 ${className}`}
          title="محفظة جوالي — Jawali"
        >
          <svg viewBox="0 0 180 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(10, 15)">
              <rect x="0" y="10" width="46" height="85" rx="10" fill="#F7941D" />
              <rect x="18" y="16" width="10" height="3" rx="1.5" fill="#FFFFFF" />
              <circle cx="28" cy="18" r="18" fill="#1C2E60" />
              <circle cx="44" cy="2" r="15" fill="#FDB913" />
              <circle cx="50" cy="24" r="16" fill="#F7941D" />
              <circle cx="68" cy="4" r="5" fill="#F7941D" />
            </g>
            <g fill="#1C2E60" transform="translate(68, 20)">
              <text
                x="45"
                y="52"
                textAnchor="middle"
                fontSize="38"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                جوالي
              </text>
              <circle cx="24" cy="62" r="3" fill="#1C2E60" />
              <circle cx="34" cy="62" r="3" fill="#1C2E60" />
              <text
                x="45"
                y="85"
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="1"
              >
                JAWALI
              </text>
            </g>
          </svg>
        </div>
      );

    case 'card':
    case 'card_future':
    default:
      return (
        <div
          style={dimensionStyle}
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-2 flex items-center justify-center text-neutral-400 shadow-md flex-shrink-0 ${className}`}
        >
          <CreditCard className="w-full h-full" />
        </div>
      );
  }
};

