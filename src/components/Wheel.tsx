import React, { useState, useEffect, useRef } from 'react';
import { ZODIACS, Zodiac } from '../types';
import { motion } from 'motion/react';

interface WheelProps {
  onSpinEnd: (zodiac: Zodiac) => void;
  isSpinning: boolean;
}

export const Wheel: React.FC<WheelProps> = ({ onSpinEnd, isSpinning }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSpinning) {
      const randomSpin = 360 * 5 + Math.floor(Math.random() * 360); // Spin at least 5 times
      const newRotation = rotation + randomSpin;
      setRotation(newRotation);

      // Calculate result
      const normalizedRotation = newRotation % 360;
      const segmentAngle = 360 / ZODIACS.length;
      // The wheel pointer is at the top (270 degrees or -90 degrees relative to standard circle)
      // Adjust calculation based on pointer position
      const winningIndex = Math.floor(((360 - normalizedRotation + 90) % 360) / segmentAngle);

      // Wait for animation to finish
      setTimeout(() => {
        onSpinEnd(ZODIACS[winningIndex]);
      }, 5000); // 5s duration matches CSS transition
    }
  }, [isSpinning]);

  const segmentAngle = 360 / ZODIACS.length; // 30 degrees per segment

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-8">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-12">
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-red-600 drop-shadow-lg"></div>
      </div>

      {/* Wheel Container */}
      <div
        className="w-full h-full rounded-full border-8 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] overflow-hidden relative bg-white transition-transform duration-[5000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* SVG Wheel with segments */}
        <svg viewBox="0 0 300 300" className="w-full h-full">
          {ZODIACS.map((zodiac, index) => {
            const startAngle = segmentAngle * index - 90; // Start from top
            const endAngle = startAngle + segmentAngle;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const cx = 150, cy = 150, r = 148;

            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);

            const largeArc = segmentAngle > 180 ? 1 : 0;
            const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            // Position for image/text - at 65% radius along the middle of the segment
            const midAngle = startAngle + segmentAngle / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const imgX = cx + r * 0.6 * Math.cos(midRad);
            const imgY = cy + r * 0.6 * Math.sin(midRad);

            // Text position - at 88% radius
            const textX = cx + r * 0.88 * Math.cos(midRad);
            const textY = cy + r * 0.88 * Math.sin(midRad);

            const colors = [
              '#fff7ed', '#fef2f2', '#f0fdf4', '#fefce8', '#fdf2f8', '#f5f3ff',
              '#ecfdf5', '#fff1f2', '#faf5ff', '#fff7ed', '#f8fafc', '#fce7f3'
            ];

            return (
              <g key={zodiac.id}>
                {/* Segment path */}
                <path
                  d={pathD}
                  fill={colors[index % colors.length]}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
                {/* Zodiac image */}
                <image
                  href={zodiac.image}
                  x={imgX - 22}
                  y={imgY - 22}
                  width="44"
                  height="44"
                  style={{ borderRadius: '50%' }}
                  transform={`rotate(${midAngle + 90}, ${imgX}, ${imgY})`}
                  preserveAspectRatio="xMidYMid slice"
                />
                {/* Zodiac name */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#4a4a4a"
                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                >
                  {zodiac.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Center Hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center">
        <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-pulse flex items-center justify-center text-white text-sm font-bold">🧧</div>
      </div>
    </div>
  );
};
