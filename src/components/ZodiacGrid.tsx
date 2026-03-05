import React from 'react';
import { Zodiac, ZODIACS } from '../types';
import { motion } from 'motion/react';

interface ZodiacGridProps {
  selectedZodiac: Zodiac | null;
  onZodiacClick: (zodiac: Zodiac) => void;
}

export const ZodiacGrid: React.FC<ZodiacGridProps> = ({ selectedZodiac, onZodiacClick }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-5xl mx-auto px-4">
      {ZODIACS.map((zodiac) => {
        const isSelected = selectedZodiac?.id === zodiac.id;

        return (
          <motion.div
            key={zodiac.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onZodiacClick(zodiac)}
            className={`
              relative p-3 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 border-2
              ${isSelected
                ? 'bg-yellow-100 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-110 z-10'
                : 'bg-white border-transparent hover:border-gray-200 shadow-sm hover:shadow-md'
              }
            `}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-bounce">
                ✨
              </div>
            )}

            {/* Zodiac Image */}
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all duration-300"
              style={{
                borderColor: isSelected ? '#eab308' : '#e5e7eb',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isSelected ? '0 0 15px rgba(234, 179, 8, 0.4)' : 'none'
              }}
            >
              <img
                src={zodiac.image}
                alt={zodiac.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="text-center">
              <h3 className={`font-bold text-sm ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                {zodiac.emoji} {zodiac.name}
              </h3>
              <p className="text-[10px] text-gray-500 line-clamp-1 hidden sm:block">
                {zodiac.description}
              </p>
            </div>

            {isSelected && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg"
              >
                Mở Lì Xì
              </motion.button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
