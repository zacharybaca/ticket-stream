import React from 'react';

export const NavbarLogo = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 450 80"
    width="450"
    height="80"
    {...props}
  >
    <defs>
      <linearGradient id="ticketMint" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="ticketTeal" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#14B8A6" />
      </linearGradient>
      <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#6EE7B7" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
      </filter>
    </defs>

    <g transform="matrix(0.18, 0, 0, 0.18, -25, -10)">
      <g transform="translate(300, 120)" filter="url(#shadow)">
        <g transform="rotate(-15) translate(-40, 20)">
          <path
            d="M 20 0 L 140 0 C 151 0 160 9 160 20 L 160 50 C 143 50 143 70 160 70 L 160 180 C 160 191 151 200 140 200 L 20 200 C 9 200 0 191 0 180 L 0 70 C 17 70 17 50 0 50 L 0 20 C 0 9 9 0 20 0 Z"
            fill="url(#ticketTeal)"
            opacity="0.85"
          />
          <line x1="20" y1="60" x2="140" y2="60" stroke="#0F172A" strokeWidth="4" strokeDasharray="8, 8" opacity="0.5" />
        </g>

        <g transform="rotate(10) translate(60, 40)">
          <path
            d="M 20 0 L 140 0 C 151 0 160 9 160 20 L 160 50 C 143 50 143 70 160 70 L 160 180 C 160 191 151 200 140 200 L 20 200 C 9 200 0 191 0 180 L 0 70 C 17 70 17 50 0 50 L 0 20 C 0 9 9 0 20 0 Z"
            fill="url(#ticketMint)"
          />
          <line x1="20" y1="60" x2="140" y2="60" stroke="#0F172A" strokeWidth="4" strokeDasharray="8, 8" opacity="0.5" />
          <path d="M 80 80 L 110 120 L 90 120 L 90 170 L 70 170 L 70 120 L 50 120 Z" fill="#0F172A" opacity="0.9" />
        </g>
      </g>

      <g stroke="url(#arrowGrad)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M 220 350 Q 250 250 220 150" />
        <path d="M 580 380 Q 550 280 580 180" />
        <path d="M 180 250 Q 200 180 170 100" strokeWidth="4" opacity="0.5" />
      </g>
    </g>

    <g transform="translate(100, 52)">
      <text
        x="0"
        y="0"
        fontFamily="'Inter', 'Segoe UI', Roboto, sans-serif"
        fontSize="34"
        fontWeight="700"
        fill="#10B981"
        letterSpacing="0.5"
      >
        Ticket Stream
      </text>
    </g>
  </svg>
);

export default NavbarLogo;
