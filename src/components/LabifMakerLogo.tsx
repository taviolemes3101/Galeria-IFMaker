import React from 'react';

interface LabifMakerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: 'dark' | 'white';
}

export const LabifMakerLogo: React.FC<LabifMakerLogoProps> = ({
  className = '',
  size = 'md',
  textColor = 'white',
}) => {
  const heightClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-10',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const textFill = textColor === 'white' ? '#FFFFFF' : '#0F172A';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <svg
        viewBox="0 0 520 185"
        className={`${heightClasses[size]} w-auto shrink-0 select-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo LABIF MAKER"
      >
        {/* 3D Symbol Graphic */}
        <g id="logo-symbol">
          {/* Red Disk - Mirrored on Y-Axis (rotate 28deg) */}
          <ellipse
            cx="48"
            cy="75"
            rx="32"
            ry="54"
            transform="rotate(28 48 75)"
            fill="#D02428"
          />

          {/* Top-Right Green Polygon */}
          <path
            d="M 98 18 C 100 17 103 18 105 19 L 160 52 C 163 54 164 57 164 60 L 164 125 C 164 128 162 131 159 132 L 103 100 C 100 98 98 95 98 92 Z"
            fill="#1D8338"
          />

          {/* Bottom Green Rhombus */}
          <path
            d="M 28 145 C 26 148 27 152 30 154 L 88 188 C 91 190 95 190 98 188 L 152 156 C 155 154 155 150 152 148 L 94 114 C 91 112 87 112 84 114 Z"
            fill="#1D8338"
          />
        </g>

        {/* Typography: LABIF MAKER */}
        <g id="logo-text" fill={textFill}>
          {/* Line 1: LABIF */}
          <text
            x="195"
            y="78"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            <tspan fontWeight="300" fontSize="72" letterSpacing="0.02em">
              LAB
            </tspan>
            <tspan fontWeight="900" fontSize="72" letterSpacing="-0.02em">
              IF
            </tspan>
          </text>

          {/* Line 2: MAKER */}
          <text
            x="195"
            y="152"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="76"
            letterSpacing="0.04em"
          >
            MAKER
          </text>
        </g>
      </svg>
    </div>
  );
};


