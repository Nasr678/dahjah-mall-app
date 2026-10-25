import React from 'react';

interface SocialBrandIconProps {
  platform: string;
  className?: string;
  size?: number;
}

export const SocialBrandIcon: React.FC<SocialBrandIconProps> = ({ 
  platform = '', 
  className = 'w-6 h-6',
  size = 24 
}) => {
  const key = platform.toLowerCase().trim();

  // 1. TikTok (Official 3D Note on Dark / Transparent Circle)
  if (key.includes('tiktok') || key.includes('تيك')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TikTok"
      >
        <circle cx="50" cy="50" r="48" fill="#010101" stroke="#222222" strokeWidth="2" />
        {/* Cyan displacement layer */}
        <path
          d="M66.5 40.5c-4.2-.3-8.2-2.1-11.2-5.1v23.4c0 10.6-8.6 19.2-19.2 19.2-5.5 0-10.5-2.3-14.1-6 2.8 1.9 6.2 3 9.9 3 9.4 0 17-7.6 17-17V22.2h6.4c1.6 6.3 6.6 11.2 12.9 12.4l-1.7 5.9z"
          fill="#25F4EE"
        />
        {/* Red / Magenta displacement layer */}
        <path
          d="M71.2 38.8c-4.3-.2-8.3-2-11.3-5v23.3c0 10.6-8.6 19.2-19.2 19.2-3.8 0-7.3-1.1-10.2-3 3.6 3.6 8.5 5.9 14 5.9 10.6 0 19.2-8.6 19.2-19.2V34.5c3.2 2.8 7.3 4.5 11.8 4.7l-4.3-.4z"
          fill="#FE2C55"
        />
        {/* Crisp White Central Silhouette */}
        <path
          d="M68.5 39.5c-4.2-.3-8.2-2.1-11.2-5.1v23.4c0 10.6-8.6 19.2-19.2 19.2-10.6 0-19.2-8.6-19.2-19.2 0-10.6 8.6-19.2 19.2-19.2 1.4 0 2.8.2 4.1.5V25c-1.3-.2-2.7-.3-4.1-.3-14.1 0-25.6 11.5-25.6 25.6S24 75.9 38.1 75.9c14.1 0 25.6-11.5 25.6-25.6V33.8c3.2 2.4 7.2 3.8 11.5 3.9v-6.7c-2.4-.1-4.7-.7-6.7-1.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 2. Facebook (Official Royal Blue Rounded Square)
  if (key.includes('facebook') || key.includes('فيسبوك')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Facebook"
      >
        <rect width="100" height="100" rx="22" fill="#1877F2" />
        <path
          d="M67.8 52.4l2.4-15.6H55.2V26.7c0-4.3 2.1-8.5 8.8-8.5h6.8V4.9c-4-.7-8.1-1-12.2-1-12.4 0-20.6 7.5-20.6 21.2v11.7H24.3v15.6h13.7V96c2.8.4 5.6.7 8.5.7 2.8 0 5.6-.3 8.5-.7V52.4h12.8z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 3. Instagram (Official Multi-stop Sunset Gradient Box with Camera)
  if (key.includes('instagram') || key.includes('انستغرام') || key.includes('انستقرام')) {
    const gradId = `ig-grad-${Math.random().toString(36).substring(2, 6)}`;
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Instagram"
      >
        <defs>
          <radialGradient id={gradId} cx="20%" cy="105%" r="130%" fx="20%" fy="105%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="10%" stopColor="#FCAF45" />
            <stop offset="30%" stopColor="#F77737" />
            <stop offset="50%" stopColor="#F56040" />
            <stop offset="75%" stopColor="#FD1D1D" />
            <stop offset="100%" stopColor="#C13584" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill={`url(#${gradId})`} />
        {/* Camera outer rounded stroke */}
        <rect x="22" y="22" width="56" height="56" rx="15" fill="none" stroke="#FFFFFF" strokeWidth="7" />
        {/* Camera lens circle */}
        <circle cx="50" cy="50" r="14" fill="none" stroke="#FFFFFF" strokeWidth="7" />
        {/* Flash dot */}
        <circle cx="66.5" cy="33.5" r="3.8" fill="#FFFFFF" />
      </svg>
    );
  }

  // 4. WhatsApp (Official Green Chat Bubble with Phone Receiver)
  if (key.includes('whatsapp') || key.includes('واتساب')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="WhatsApp"
      >
        <circle cx="50" cy="50" r="48" fill="#25D366" />
        <path
          d="M50.2 18c-17.5 0-31.7 14.2-31.7 31.7 0 5.6 1.5 11 4.2 15.7L18 82.5l17.6-4.6c4.5 2.5 9.7 3.8 14.6 3.8 17.5 0 31.7-14.2 31.7-31.7S67.7 18 50.2 18zm0 57.8c-4.7 0-9.3-1.3-13.3-3.6l-1-.6-9.9 2.6 2.6-9.6-.6-1c-2.5-4.1-3.9-8.8-3.9-13.7 0-14.6 11.9-26.4 26.4-26.4 14.6 0 26.4 11.9 26.4 26.4 0 14.5-11.9 26.3-26.6 26.3zm14.5-19.8c-.8-.4-4.7-2.3-5.4-2.6-.7-.3-1.2-.4-1.8.4-.5.8-2 2.6-2.5 3.1-.5.5-.9.6-1.7.2-.8-.4-3.4-1.3-6.5-4-2.4-2.1-4-4.8-4.5-5.6-.5-.8 0-1.2.4-1.6.4-.4.8-.9 1.2-1.4.4-.5.5-.8.8-1.3.3-.5.1-1-.1-1.4-.2-.4-1.8-4.4-2.5-6-.7-1.6-1.4-1.3-1.9-1.3-.5 0-1.1 0-1.7 0s-1.6.2-2.4 1.1c-.8.9-3.2 3.1-3.2 7.6s3.3 8.8 3.7 9.4c.5.6 6.4 9.8 15.6 13.8 2.2.9 3.9 1.5 5.2 2 2.2.7 4.2.6 5.8.4 1.8-.3 5.5-2.2 6.3-4.4.8-2.2.8-4.1.6-4.5-.3-.4-.8-.7-1.6-1.1z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 5. Telegram (Official Sky Blue Circle with Paper Airplane)
  if (key.includes('telegram') || key.includes('تيليجرام') || key.includes('تليجرام')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Telegram"
      >
        <circle cx="50" cy="50" r="48" fill="#24A1DE" />
        <path
          d="M74.8 28.5L64.2 78.4c-.8 3.5-2.9 4.4-5.8 2.7L42.2 69.1l-7.8 7.5c-.9.9-1.6 1.6-3.3 1.6l1.2-16.5 30-27.1c1.3-1.2-.3-1.8-2-.7L23.2 60.1 7.2 55.1c-3.5-1.1-3.6-3.5.7-5.2l62.4-24.1c2.9-1.1 5.4.7 4.5 2.7z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 6. YouTube (Official Red Rounded Box with White Triangle)
  if (key.includes('youtube') || key.includes('يوتيوب')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="YouTube"
      >
        <rect width="100" height="100" rx="22" fill="#FF0000" />
        <path d="M42 34l24 16-24 16V34z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 7. Snapchat (Official Yellow Box with White Ghost)
  if (key.includes('snapchat') || key.includes('سناب')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Snapchat"
      >
        <rect width="100" height="100" rx="22" fill="#FFFC00" />
        <path
          d="M50 22c-11 0-18 8-18 17 0 4 1.5 8 3.5 10-.7 2-3 2.5-4.5 3-1.5.5-2.5 1.5-2.5 3 0 2 2.5 3.5 5 3.5 1 0 2-.2 3-.5 1.5 5 4.5 8.5 7.5 10-1.5 1-4 1.5-6.5 2-2 .5-3 1.5-3 3 0 2 2.5 3.5 6 3.5 3 0 6.5-1 9.5-2.5 3 1.5 6.5 2.5 9.5 2.5 3.5 0 6-1.5 6-3.5 0-1.5-1-2.5-3-3-2.5-.5-5-1-6.5-2 3-1.5 6-5 7.5-10 1 .3 2 .5 3 .5 2.5 0 5-1.5 5-3.5 0-1.5-1-2.5-2.5-3-1.5-.5-3.8-1-4.5-3 2-2 3.5-6 3.5-10 0-9-7-17-18-17z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3"
        />
      </svg>
    );
  }

  // 8. X / Twitter (Official Clean Dark & X)
  if (key.includes('twitter') || key.includes('تويتر') || key === 'x') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="X"
      >
        <rect width="100" height="100" rx="22" fill="#000000" stroke="#333333" strokeWidth="2" />
        <path
          d="M68.5 24H78L57.2 47.7 81.6 80H62.5L47.5 60.4 30.4 80H20.9l22.2-25.4L20 24h19.6l13.6 18 15.3-18zm-3.3 50.3h5.3L36.4 29.4h-5.6l34.4 44.9z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 9. Email / Mail (Official Amber / Red Mail Box)
  if (key.includes('email') || key.includes('mail') || key.includes('بريد') || key.includes('ايميل')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Email"
      >
        <rect width="100" height="100" rx="22" fill="#EA4335" />
        <path
          d="M22 30h56c3.3 0 6 2.7 6 6v32c0 3.3-2.7 6-6 6H22c-3.3 0-6-2.7-6-6V36c0-3.3 2.7-6 6-6zm3 8l25 18 25-18H25zm53 6.5L52.8 62.8a4.5 4.5 0 0 1-5.6 0L22 44.5V68h56V44.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 10. Phone / Call (Official Emerald Call Box)
  if (key.includes('phone') || key.includes('call') || key.includes('هاتف') || key.includes('اتصال') || key.includes('جوال')) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        width={size} 
        height={size} 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Phone"
      >
        <rect width="100" height="100" rx="22" fill="#10B981" />
        <path
          d="M33 26c2.5-3.5 7-4 10-1.5l6.5 5.5c2.5 2 3 5.5 1 8l-3.5 4.5c4.5 7 10 12.5 17 17l4.5-3.5c2.5-2 6-1.5 8 1l5.5 6.5c2.5 3 2 7.5-1.5 10l-4 3c-4 3-10 4-19-1.5-10-6-18.5-14.5-24.5-24.5-5.5-9-4.5-15-1.5-19l3-4z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Generic fallback globe
  return (
    <div className={`rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold ${className}`}>
      🌐
    </div>
  );
};
