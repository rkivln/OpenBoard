import React from 'react';
import { WashiPattern } from '../types.ts';

export const WASHI_PATTERNS: { id: WashiPattern; name: string; bg: string; border: string }[] = [
  { id: 'purple-grid', name: 'Purple Grid', bg: '#f3e8ff', border: '#a855f7' },
  { id: 'confetti', name: 'Memphis Confetti', bg: '#fef3c7', border: '#f59e0b' },
  { id: 'checker', name: 'Blue Checker', bg: '#dbeafe', border: '#3b82f6' },
  { id: 'stars', name: 'Starry Sky', bg: '#1e293b', border: '#e2e8f0' },
  { id: 'hazard', name: 'Yellow Green Stripe', bg: '#ecfccb', border: '#84cc16' },
  { id: 'floral', name: 'Pink Doodle', bg: '#fce7f3', border: '#ec4899' },
  { id: 'galaxy', name: 'Cosmic Violet', bg: '#581c87', border: '#c084fc' },
  { id: 'botanical', name: 'Botanical Green', bg: '#dcfce7', border: '#22c55e' },
];

export const PatternDefs: React.FC = () => {
  return (
    <>
      {/* Purple Grid Pattern */}
      <pattern id="pattern-purple-grid" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#faf5ff" />
        <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#c084fc" strokeWidth="1.2" />
      </pattern>
      <pattern id="pat-purple-grid" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#faf5ff" />
        <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#c084fc" strokeWidth="1.2" />
      </pattern>

      {/* Memphis Confetti */}
      <pattern id="pattern-confetti" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#fffbeb" />
        <circle cx="4" cy="5" r="1.5" fill="#f43f5e" />
        <circle cx="16" cy="14" r="1.5" fill="#3b82f6" />
        <rect x="12" y="3" width="3" height="3" fill="#10b981" transform="rotate(25 13 4)" />
        <path d="M 3 15 Q 6 12 8 16" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
      </pattern>
      <pattern id="pat-confetti" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#fffbeb" />
        <circle cx="4" cy="5" r="1.5" fill="#f43f5e" />
        <circle cx="16" cy="14" r="1.5" fill="#3b82f6" />
        <rect x="12" y="3" width="3" height="3" fill="#10b981" transform="rotate(25 13 4)" />
        <path d="M 3 15 Q 6 12 8 16" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
      </pattern>

      {/* Checkerboard */}
      <pattern id="pattern-checker" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#eff6ff" />
        <rect width="8" height="8" fill="#3b82f6" />
        <rect x="8" y="8" width="8" height="8" fill="#3b82f6" />
      </pattern>
      <pattern id="pat-checker" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#eff6ff" />
        <rect width="8" height="8" fill="#3b82f6" />
        <rect x="8" y="8" width="8" height="8" fill="#3b82f6" />
      </pattern>

      {/* Starry Sky */}
      <pattern id="pattern-stars" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#0f172a" />
        <polygon points="5,1 6,3 8,3 6.5,4.5 7,6.5 5,5 3,6.5 3.5,4.5 2,3 4,3" fill="#fef08a" />
        <circle cx="15" cy="12" r="1" fill="#f8fafc" />
        <circle cx="12" cy="5" r="0.8" fill="#38bdf8" />
      </pattern>
      <pattern id="pat-stars" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#0f172a" />
        <polygon points="5,1 6,3 8,3 6.5,4.5 7,6.5 5,5 3,6.5 3.5,4.5 2,3 4,3" fill="#fef08a" />
        <circle cx="15" cy="12" r="1" fill="#f8fafc" />
        <circle cx="12" cy="5" r="0.8" fill="#38bdf8" />
      </pattern>

      {/* Diagonal Green/Yellow Stripes */}
      <pattern id="pattern-hazard" width="14" height="14" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#fef08a" />
        <line x1="0" y1="0" x2="0" y2="14" stroke="#16a34a" strokeWidth="7" />
      </pattern>
      <pattern id="pat-hazard" width="14" height="14" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#fef08a" />
        <line x1="0" y1="0" x2="0" y2="14" stroke="#16a34a" strokeWidth="7" />
      </pattern>

      {/* Pink Doodle */}
      <pattern id="pattern-floral" width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill="#fdf2f8" />
        <circle cx="9" cy="9" r="3" fill="#f472b6" />
        <circle cx="9" cy="9" r="1.2" fill="#fbbf24" />
        <circle cx="2" cy="2" r="1" fill="#ec4899" />
        <circle cx="16" cy="16" r="1" fill="#ec4899" />
      </pattern>
      <pattern id="pat-floral" width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill="#fdf2f8" />
        <circle cx="9" cy="9" r="3" fill="#f472b6" />
        <circle cx="9" cy="9" r="1.2" fill="#fbbf24" />
        <circle cx="2" cy="2" r="1" fill="#ec4899" />
        <circle cx="16" cy="16" r="1" fill="#ec4899" />
      </pattern>

      {/* Cosmic Galaxy */}
      <pattern id="pattern-galaxy" width="22" height="22" patternUnits="userSpaceOnUse">
        <rect width="22" height="22" fill="#3b0764" />
        <circle cx="6" cy="6" r="1.5" fill="#e879f9" opacity="0.8" />
        <circle cx="16" cy="14" r="2" fill="#818cf8" opacity="0.8" />
        <circle cx="18" cy="4" r="0.8" fill="#ffffff" />
        <circle cx="3" cy="18" r="0.8" fill="#ffffff" />
      </pattern>
      <pattern id="pat-galaxy" width="22" height="22" patternUnits="userSpaceOnUse">
        <rect width="22" height="22" fill="#3b0764" />
        <circle cx="6" cy="6" r="1.5" fill="#e879f9" opacity="0.8" />
        <circle cx="16" cy="14" r="2" fill="#818cf8" opacity="0.8" />
        <circle cx="18" cy="4" r="0.8" fill="#ffffff" />
        <circle cx="3" cy="18" r="0.8" fill="#ffffff" />
      </pattern>

      {/* Botanical */}
      <pattern id="pattern-botanical" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#f0fdf4" />
        <ellipse cx="6" cy="7" rx="3" ry="1.5" fill="#22c55e" transform="rotate(-30 6 7)" />
        <ellipse cx="12" cy="11" rx="3" ry="1.5" fill="#15803d" transform="rotate(30 12 11)" />
        <circle cx="14" cy="4" r="1.2" fill="#f97316" />
      </pattern>
      <pattern id="pat-botanical" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#f0fdf4" />
        <ellipse cx="6" cy="7" rx="3" ry="1.5" fill="#22c55e" transform="rotate(-30 6 7)" />
        <ellipse cx="12" cy="11" rx="3" ry="1.5" fill="#15803d" transform="rotate(30 12 11)" />
        <circle cx="14" cy="4" r="1.2" fill="#f97316" />
      </pattern>
    </>
  );
};

export const SvgPatternDefs: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <PatternDefs />
      </defs>
    </svg>
  );
};
