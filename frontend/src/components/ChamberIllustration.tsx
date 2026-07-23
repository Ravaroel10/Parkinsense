/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ChamberIllustrationProps {
  isRecording?: boolean;
  isStabilizing?: boolean;
  activeSensor?: number | null; // null for all, or 1-4
  className?: string;
}

export default function ChamberIllustration({
  isRecording = false,
  isStabilizing = false,
  activeSensor = null,
  className = "",
}: ChamberIllustrationProps) {
  return (
    <div className={`relative w-full max-w-md mx-auto aspect-square flex items-center justify-center p-4 bg-white rounded-xl border border-zinc-200 shadow-inner ${className}`}>
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-[350px]"
      >
        {/* Background Grid Accent */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-100" />
          </pattern>
          <linearGradient id="chamberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Grid Floor */}
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />
 
        {/* Ambient Glows */}
        {(isRecording || isStabilizing) && (
          <circle cx="200" cy="220" r="120" fill="url(#chamberGrad)" className="animate-pulse" opacity="0.8" />
        )}
 
        {/* Base Stage / Metal Plate */}
        <path
          d="M 60 280 L 200 340 L 340 280 L 200 240 Z"
          fill="#F1F5F9"
          stroke="#E2E8F0"
          strokeWidth="2"
        />
        
        {/* Biological Sample Swab Tray */}
        <ellipse cx="200" cy="290" rx="45" ry="20" fill="#CBD5E1" />
        <ellipse cx="200" cy="287" rx="40" ry="17" fill="#F8FAFC" />
        
        {/* Sebum Sample Sw swab */}
        <g id="sebum-sample" className="cursor-pointer">
          <ellipse cx="200" cy="285" rx="20" ry="10" fill="#FEF08A" opacity="0.9" />
          <circle cx="202" cy="283" r="5" fill="#FEF08A" filter="blur(1px)" />
          {/* Scientific labeling */}
          <text x="230" y="315" className="font-mono text-[9px] fill-black font-semibold" textAnchor="middle">
            SEBUM SAMPLE (100μL)
          </text>
          <line x1="200" y1="285" x2="230" y2="305" stroke="#0D9488" strokeWidth="1" strokeDasharray="2,2" />
        </g>
 
        {/* Multiplexer (PCA9548A) Board under the shelf */}
        <g transform="translate(130, 210)">
          <rect x="0" y="0" width="40" height="25" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="5" y="5" width="30" height="15" rx="1" fill="#0F172A" />
          <text x="20" y="15" fill="#38BDF8" className="font-mono text-[6px] font-bold" textAnchor="middle">I2C MUX</text>
        </g>
 
        {/* Acrylic Chamber Columns (Vertical Supports) */}
        <line x1="60" y1="280" x2="60" y2="100" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="340" y1="280" x2="340" y2="100" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="200" y1="340" x2="200" y2="160" stroke="#E2E8F0" strokeWidth="1.5" />
 
        {/* 4 Sensor Modules (BME680 Mounted on vertical posts) */}
        {/* Sensor 1 (CH1) - Top Left */}
        <g transform="translate(100, 140)" className={activeSensor === null || activeSensor === 1 ? "opacity-100" : "opacity-40"}>
          {/* PCB */}
          <rect x="0" y="0" width="22" height="22" rx="3" fill="#065F46" stroke="#047857" strokeWidth="1" />
          {/* BME680 Silver Cap */}
          <rect x="5" y="5" width="8" height="8" rx="1" fill="#E2E8F0" stroke="#CBD5E1" />
          {/* Active indicator */}
          <circle cx="16" cy="16" r="2.5" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#94A3B8"} className={isRecording || isStabilizing ? "animate-ping" : ""} />
          <circle cx="16" cy="16" r="2" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#64748B"} />
          <text x="11" y="-4" className="font-mono text-[8px] fill-zinc-700 font-bold" textAnchor="middle">CH1</text>
        </g>
 
        {/* Sensor 2 (CH2) - Top Right */}
        <g transform="translate(278, 140)" className={activeSensor === null || activeSensor === 2 ? "opacity-100" : "opacity-40"}>
          <rect x="0" y="0" width="22" height="22" rx="3" fill="#065F46" stroke="#047857" strokeWidth="1" />
          <rect x="5" y="5" width="8" height="8" rx="1" fill="#E2E8F0" stroke="#CBD5E1" />
          <circle cx="16" cy="16" r="2.5" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#94A3B8"} className={isRecording || isStabilizing ? "animate-ping" : ""} />
          <circle cx="16" cy="16" r="2" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#64748B"} />
          <text x="11" y="-4" className="font-mono text-[8px] fill-zinc-700 font-bold" textAnchor="middle">CH2</text>
        </g>
 
        {/* Sensor 3 (CH3) - Mid Left */}
        <g transform="translate(80, 200)" className={activeSensor === null || activeSensor === 3 ? "opacity-100" : "opacity-40"}>
          <rect x="0" y="0" width="22" height="22" rx="3" fill="#065F46" stroke="#047857" strokeWidth="1" />
          <rect x="5" y="5" width="8" height="8" rx="1" fill="#E2E8F0" stroke="#CBD5E1" />
          <circle cx="16" cy="16" r="2.5" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#94A3B8"} className={isRecording || isStabilizing ? "animate-ping" : ""} />
          <circle cx="16" cy="16" r="2" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#64748B"} />
          <text x="11" y="-4" className="font-mono text-[8px] fill-zinc-700 font-bold" textAnchor="middle">CH3</text>
        </g>
 
        {/* Sensor 4 (CH4) - Mid Right */}
        <g transform="translate(298, 200)" className={activeSensor === null || activeSensor === 4 ? "opacity-100" : "opacity-40"}>
          <rect x="0" y="0" width="22" height="22" rx="3" fill="#065F46" stroke="#047857" strokeWidth="1" />
          <rect x="5" y="5" width="8" height="8" rx="1" fill="#E2E8F0" stroke="#CBD5E1" />
          <circle cx="16" cy="16" r="2.5" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#94A3B8"} className={isRecording || isStabilizing ? "animate-ping" : ""} />
          <circle cx="16" cy="16" r="2" fill={isRecording ? "#22C55E" : isStabilizing ? "#F59E0B" : "#64748B"} />
          <text x="11" y="-4" className="font-mono text-[8px] fill-zinc-700 font-bold" textAnchor="middle">CH4</text>
        </g>
 
        {/* Acrylic Chamber Canopy / Lid */}
        <path
          d="M 60 100 L 200 160 L 340 100 L 200 60 Z"
          fill="#F1F5F9"
          stroke="#E2E8F0"
          strokeWidth="2"
          opacity="0.9"
        />
 
        {/* Active Air Filter & Inlet Assembly on top of the lid */}
        <g transform="translate(180, 50)">
          <rect x="5" y="-10" width="30" height="25" rx="3" fill="#475569" stroke="#334155" strokeWidth="1.5" />
          <rect x="10" y="-20" width="20" height="10" rx="1" fill="#94A3B8" />
          <text x="20" y="5" fill="#E2E8F0" className="font-mono text-[6px]" textAnchor="middle">AIR FILTER</text>
          {/* Air Filter Inlet Icon Lines */}
          <line x1="20" y1="-25" x2="20" y2="-20" stroke="#38BDF8" strokeWidth="1" />
          <line x1="15" y1="-25" x2="15" y2="-21" stroke="#38BDF8" strokeWidth="1" />
          <line x1="25" y1="-25" x2="25" y2="-21" stroke="#38BDF8" strokeWidth="1" />
        </g>
 
        {/* Transparent Acrylic/Glass Outer Chamber Enclosure (Semi-transparent path) */}
        <path
          d="M 60 100 L 200 160 L 340 100 L 340 280 L 200 340 L 60 280 Z"
          fill="url(#glassGrad)"
          stroke="#0F766E"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          opacity="0.8"
        />
 
        {/* Dynamic Airflow lines showing vacuum action */}
        {(isRecording || isStabilizing) && (
          <g className="opacity-70">
            {/* Dashed flowing lines from top to bottom */}
            <path
              d="M 200 80 Q 180 130 150 200 T 200 280"
              stroke="#14B8A6"
              strokeWidth="1.5"
              strokeDasharray="4,6"
              strokeDashoffset="10"
              className="animate-[dash_1.5s_linear_infinite]"
            >
              <animate attributeName="stroke-dashoffset" values="40;0" dur="1.5s" repeatCount="indefinite" />
            </path>
            <path
              d="M 200 80 Q 220 130 250 200 T 200 280"
              stroke="#14B8A6"
              strokeWidth="1.5"
              strokeDasharray="4,6"
              className="animate-[dash_1.5s_linear_infinite]"
            >
              <animate attributeName="stroke-dashoffset" values="0;40" dur="1.5s" repeatCount="indefinite" />
            </path>
          </g>
        )}
 
        {/* ESP32 Controller Module lying on workspace next to chamber */}
        <g transform="translate(230, 310)">
          {/* Board */}
          <path
            d="M 10 10 L 60 30 L 40 45 L -10 25 Z"
            fill="#334155"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Metal Shield / Processor */}
          <path
            d="M 25 18 L 45 26 L 38 32 L 18 24 Z"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="0.5"
          />
          {/* Glowing power LED */}
          <circle cx="15" cy="18" r="1.5" fill="#EF4444" />
          <circle cx="15" cy="18" r="3" fill="#EF4444" opacity="0.4" className="animate-pulse" />
          {/* Label */}
          <text x="35" y="42" fill="#94A3B8" className="font-mono text-[7px]" transform="rotate(15, 35, 42)">ESP32 DEV</text>
        </g>
 
        {/* Connecting Ribbon Cable (Multiplexer to ESP32) */}
        <path
          d="M 170 230 C 200 240, 220 270, 240 315"
          fill="none"
          stroke="#475569"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Colorful stripes on flat ribbon cable */}
        <path
          d="M 170 230 C 200 240, 220 270, 240 315"
          fill="none"
          stroke="#EF4444"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="1,1"
        />
 
        {/* Medical/Research Label overlay */}
        <rect x="15" y="15" width="130" height="24" rx="4" fill="#0F766E" fillOpacity="0.08" stroke="#0F766E" strokeOpacity="0.2" />
        <circle cx="27" cy="27" r="4" fill="#22C55E" />
        <circle cx="27" cy="27" r="6" stroke="#22C55E" strokeWidth="1" strokeOpacity="0.5" className="animate-sensor-pulse" />
        <text x="38" y="27" fill="#0F766E" className="font-mono text-[8px] font-bold">SYSTEM STABLE</text>
        <text x="38" y="34" fill="#64748B" className="font-sans text-[6px]">PCA9548A + 4x BME680</text>
      </svg>
    </div>
  );
}
