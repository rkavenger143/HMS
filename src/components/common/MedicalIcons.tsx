import React from 'react';

export type MedicalIconName =
  | 'dashboard'
  | 'ai'
  | 'patients'
  | 'appointments'
  | 'opd'
  | 'ipd'
  | 'nursing'
  | 'diet'
  | 'laboratory'
  | 'radiology'
  | 'pharmacy'
  | 'billing'
  | 'doctors'
  | 'ambulance'
  | 'bloodbank'
  | 'reports'
  | 'admin'
  | 'settings'
  | 'vitals'
  | 'emergency'
  | 'heart-pulse'
  | 'heart-cross'
  | 'heart-care'
  | 'heart-bed'
  | 'heart-calendar'
  | 'heart-flask'
  | 'heart-scan'
  | 'heart-pill'
  | 'heart-blood'
  | 'heart-invoice'
  | 'heart-chart'
  | 'heart-stethoscope'
  | 'heart-hospital'
  | 'heart-settings';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type IconVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal' | 'neutral';

interface MedicalIconProps {
  name: MedicalIconName;
  size?: IconSize;
  color?: string;
  className?: string;
  strokeWidth?: number;
  badge?: boolean;
  variant?: IconVariant;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<string, number> = {
  xs: 13,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

const VARIANT_STYLES: Record<IconVariant, { bg: string; color: string; border?: string }> = {
  default: { bg: 'transparent', color: 'currentColor' },
  primary: { bg: 'var(--color-primary-muted)', color: 'var(--color-primary)', border: 'rgba(5, 150, 105, 0.2)' },
  success: { bg: 'var(--color-success-muted)', color: 'var(--color-success)', border: 'rgba(22, 163, 74, 0.2)' },
  warning: { bg: 'var(--color-warning-muted)', color: 'var(--color-warning)', border: 'rgba(217, 119, 6, 0.2)' },
  danger: { bg: 'var(--color-danger-muted)', color: 'var(--color-danger)', border: 'rgba(220, 38, 38, 0.2)' },
  info: { bg: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: 'rgba(2, 132, 199, 0.2)' },
  purple: { bg: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', border: 'rgba(124, 58, 237, 0.2)' },
  teal: { bg: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', border: 'rgba(13, 148, 136, 0.2)' },
  neutral: { bg: 'var(--bg-surface)', color: 'var(--text-secondary)', border: 'var(--border-default)' },
};

/**
 * Standard Heart Medical Outline Path (Common vector base for heart-shaped healthcare icons)
 */
const HEART_BASE_PATH = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

/**
 * Modern Heart-Shaped & ECG-Inspired Vector Icon Suite
 */
export default function MedicalIcon({
  name,
  size = 'md',
  color,
  className = '',
  strokeWidth = 2,
  badge = false,
  variant = 'default',
  style,
}: MedicalIconProps) {
  const pixelSize = typeof size === 'number' ? size : (SIZE_MAP[size] || 20);
  const iconColor = color || (variant !== 'default' ? VARIANT_STYLES[variant].color : 'currentColor');

  const renderVector = () => {
    switch (name) {
      // 1. Dashboard / Heart + ECG Pulse Line
      case 'dashboard':
      case 'heart-pulse':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d={HEART_BASE_PATH} />
            <path d="M2.5 12h4.5l2-4 3.5 8 2.5-5.5 1.5 2.5h5" strokeWidth={strokeWidth + 0.3} />
          </svg>
        );

      // 2. Patients / Heart + Patient Profile Care
      case 'patients':
      case 'heart-care':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" opacity="0.35" />
            <circle cx="12" cy="8" r="3" />
            <path d="M6 18c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            <path d="M9 13.5l3 3 5-5" strokeWidth={strokeWidth + 0.2} />
          </svg>
        );

      // 3. OPD / Heart + Live Consultation Vital Wave
      case 'opd':
      case 'vitals':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 8.6c0 4.2-3.8 7.6-8.8 12.2-5-4.6-8.8-8-8.8-12.2 0-3.1 2.4-5.6 5.5-5.6 1.7 0 3.4.8 4.3 2.1.9-1.3 2.6-2.1 4.3-2.1 3.1 0 5.5 2.5 5.5 5.6z" />
            <path d="M4 12h3.5l1.8-3.5 2.7 7 2-4.5 1.5 2h4.5" strokeWidth={strokeWidth + 0.2} />
            <circle cx="17.5" cy="6.5" r="1" fill={iconColor} />
          </svg>
        );

      // 4. IPD & Beds / Heart + Hospital Bed
      case 'ipd':
      case 'heart-bed':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.5 8.5a4.5 4.5 0 0 0-7.5-3.3A4.5 4.5 0 0 0 4.5 8.5c0 3.5 3.5 6.5 7.5 10.5 4-4 7.5-7 7.5-10.5z" opacity="0.3" />
            <path d="M3 17h18" />
            <path d="M3 13h18v4H3z" />
            <path d="M3 9v8" />
            <path d="M21 11v6" />
            <path d="M7 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
            <path d="M13 10h6" />
          </svg>
        );

      // 5. Nursing / Heart + Medical Cross
      case 'nursing':
      case 'heart-cross':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d={HEART_BASE_PATH} />
            <path d="M12 7.5v7M8.5 11h7" strokeWidth={strokeWidth + 0.5} />
          </svg>
        );

      // 6. Appointments / Heart + Calendar Scheduling
      case 'appointments':
      case 'heart-calendar':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <path d="M12 18.5l-1-.9c-3.6-3.2-6-5.4-6-8.1 0-2.2 1.8-4 4-4 1.2 0 2.4.6 3 1.5.6-.9 1.8-1.5 3-1.5 2.2 0 4 1.8 4 4 0 2.7-2.4 4.9-6 8.1l-1 .9z" fill={iconColor} fillOpacity="0.2" strokeWidth="1.5" />
          </svg>
        );

      // 7. Laboratory / Heart + Pathology Flask
      case 'laboratory':
      case 'heart-flask':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.5 8.5a4.5 4.5 0 0 0-7.5-3.3A4.5 4.5 0 0 0 5.5 8.5c0 3.5 3.5 6.5 7.5 10.5 4-4 7.5-7 7.5-10.5z" opacity="0.25" />
            <path d="M10 2h4M12 2v6L7 17.5A2 2 0 0 0 8.8 20.5h6.4A2 2 0 0 0 17 17.5L12 8" />
            <path d="M8.5 14h7" />
            <circle cx="12" cy="17" r="1" fill={iconColor} />
            <circle cx="10" cy="16" r="0.6" fill={iconColor} />
          </svg>
        );

      // 8. Radiology / Heart + Medical Scan
      case 'radiology':
      case 'heart-scan':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
            <path d="M12 17.5l-1-.9c-3.6-3.2-6-5.4-6-8.1 0-2.2 1.8-4 4-4 1.2 0 2.4.6 3 1.5.6-.9 1.8-1.5 3-1.5 2.2 0 4 1.8 4 4 0 2.7-2.4 4.9-6 8.1l-1 .9z" />
            <path d="M8 12h8" strokeDasharray="1.5 1.5" />
          </svg>
        );

      // 9. Pharmacy / Heart + Medicine Capsule
      case 'pharmacy':
      case 'heart-pill':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.5 8.5a4.5 4.5 0 0 0-7.5-3.3A4.5 4.5 0 0 0 5.5 8.5c0 3.5 3.5 6.5 7.5 10.5 4-4 7.5-7 7.5-10.5z" opacity="0.25" />
            <path d="M10.5 6.5l7 7a3.5 3.5 0 0 1-5 5l-7-7a3.5 3.5 0 0 1 5-5z" />
            <path d="M8.5 11.5l5 5" strokeWidth={strokeWidth + 0.3} />
            <path d="M16 4.5v3M14.5 6h3" />
          </svg>
        );

      // 10. Blood Bank / Heart + Blood Droplet
      case 'bloodbank':
      case 'heart-blood':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d={HEART_BASE_PATH} opacity="0.3" />
            <path d="M12 4s-4.5 5.5-4.5 8.5a4.5 4.5 0 0 0 9 0C16.5 9.5 12 4 12 4z" fill={iconColor} fillOpacity="0.2" />
            <path d="M12 10v4M10 12h4" strokeWidth={strokeWidth + 0.2} />
          </svg>
        );

      // 11. Billing / Heart + Medical Invoice
      case 'billing':
      case 'heart-invoice':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 3H5a2 2 0 0 0-2 2v15l3-2 3 2 3-2 3 2 3-2 3 2V5a2 2 0 0 0-2-2z" />
            <path d="M8 7h8M8 11h8M8 15h4" />
            <path d="M15 14.5l-.8-.7c-2.4-2.1-4-3.6-4-5.4 0-1.5 1.2-2.7 2.7-2.7.8 0 1.6.4 2 1 .4-.6 1.2-1 2-1 1.5 0 2.7 1.2 2.7 2.7 0 1.8-1.6 3.3-4 5.4l-.6.7z" fill={iconColor} fillOpacity="0.3" />
          </svg>
        );

      // 12. Reports / Heart + Medical Chart & Analytics
      case 'reports':
      case 'heart-chart':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 16v-3M11 16V9M15 16v-5M19 16V7" strokeWidth={strokeWidth + 0.2} />
            <path d="M15.5 6.5a2.5 2.5 0 0 0-4.2-1.8 2.5 2.5 0 0 0-3.3 3.6c1.6 1.8 4.2 3.7 4.2 3.7s2.6-1.9 4.2-3.7a2.5 2.5 0 0 0-.9-1.8z" fill={iconColor} fillOpacity="0.25" />
          </svg>
        );

      // 13. Doctors / Heart + Stethoscope
      case 'doctors':
      case 'heart-stethoscope':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3v5a5 5 0 0 0 10 0V3M5 3h2M15 3h2" />
            <path d="M11 13v2a4 4 0 0 0 8 0v-2" />
            <circle cx="19" cy="13" r="1.8" fill={iconColor} />
            <path d="M16 19.5l-.8-.7c-2.4-2.1-4-3.6-4-5.4 0-1.5 1.2-2.7 2.7-2.7.8 0 1.6.4 2 1 .4-.6 1.2-1 2-1 1.5 0 2.7 1.2 2.7 2.7 0 1.8-1.6 3.3-4 5.4l-.6.7z" opacity="0.35" />
          </svg>
        );

      // 14. Emergency & Ambulance / Heart + Emergency Cross
      case 'ambulance':
      case 'emergency':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="16" height="11" rx="2" />
            <path d="M18 10l3 2v5h-3" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="16" cy="18" r="2" />
            <path d="M10 8.5v4M8 10.5h4" strokeWidth={strokeWidth + 0.3} />
            <path d="M10 2l1 2h-2z" fill={iconColor} />
          </svg>
        );

      // 15. Admin / Heart + Hospital Facility
      case 'admin':
      case 'heart-hospital':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            <path d="M12 7v4M10 9h4" strokeWidth={strokeWidth + 0.3} />
            <rect x="8" y="14" width="3" height="3" rx="0.5" />
            <rect x="13" y="14" width="3" height="3" rx="0.5" />
          </svg>
        );

      // 16. Settings / Heart + Medical Config Gear
      case 'settings':
      case 'heart-settings':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );

      // 17. Diet & Nutrition / Heart + Diet Utensils
      case 'diet':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d={HEART_BASE_PATH} opacity="0.25" />
            <path d="M7 4v6a3 3 0 0 0 6 0V4M10 10v10M17 4v16M14 4h6" />
          </svg>
        );

      // 18. AI Operations / Heart + Neural Clinical Intelligence
      case 'ai':
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d={HEART_BASE_PATH} opacity="0.35" />
            <circle cx="12" cy="11" r="2.5" fill={iconColor} />
            <path d="M12 4v2M12 16v2M5 11h2M17 11h2M7 6l1.5 1.5M15.5 14.5L17 16M7 16l1.5-1.5M15.5 7.5L17 6" strokeWidth={strokeWidth - 0.3} />
          </svg>
        );

      default:
        return (
          <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d={HEART_BASE_PATH} />
            <path d="M2.5 12h4.5l2-4 3.5 8 2.5-5.5 1.5 2.5h5" />
          </svg>
        );
    }
  };

  if (!badge) {
    return (
      <span
        className={`medical-icon ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          ...style,
        }}
      >
        {renderVector()}
      </span>
    );
  }

  const vStyle = VARIANT_STYLES[variant];
  const badgePadding = pixelSize >= 24 ? 10 : pixelSize >= 18 ? 8 : 6;

  return (
    <span
      className={`medical-icon-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: vStyle.bg,
        color: vStyle.color,
        border: vStyle.border ? `1px solid ${vStyle.border}` : 'none',
        borderRadius: 'var(--radius-md)',
        padding: badgePadding,
        transition: 'all var(--transition-fast)',
        flexShrink: 0,
        ...style,
      }}
    >
      {renderVector()}
    </span>
  );
}

/**
 * Hospital Medical Heart Brand Logo SVG
 */
export function MedicalBrandLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {/* Outer Heart-Shaped Medical Shield */}
      <path
        d="M16 3C9.5 3 4 7.5 4 14C4 22 16 30 16 30C16 30 28 22 28 14C28 7.5 22.5 3 16 3Z"
        fill="url(#heartLogoGrad)"
      />
      {/* Central Medical Hospital Cross */}
      <path
        d="M14 9H18V13H22V17H18V21H14V17H10V13H14V9Z"
        fill="white"
      />
      {/* Active Clinical ECG Rhythm Wave */}
      <path
        d="M6 15H10.5L12.5 10.5L15 18.5L17.5 12L19.5 16H26"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="heartLogoGrad" x1="4" y1="3" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}
